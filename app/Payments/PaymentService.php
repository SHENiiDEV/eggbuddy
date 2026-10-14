<?php

namespace App\Payments;

use App\Billing\InvoiceService;
use App\Billing\Wallet;
use App\Mail\TopUpReceiptMail;
use App\Models\CoinTransaction;
use App\Models\Payment;
use App\Models\User;
use App\Support\Money;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class PaymentService
{
    public function __construct(
        private readonly GatewayManager $gateways,
        private readonly Wallet $wallet,
        private readonly InvoiceService $invoices,
    ) {}

    /** Coin packages as shown to customers. */
    public function packages(): array
    {
        $currency = config('payments.currency');

        return collect(config('payments.packages'))
            ->map(fn ($p, $key) => [
                'key' => $key,
                'name' => $p['name'],
                'coins' => $p['coins'],
                'bonus' => $p['bonus'] ?? 0,
                'total_coins' => $p['coins'] + ($p['bonus'] ?? 0),
                'price' => $p['price'],
                'price_formatted' => Money::format($p['price'], $currency),
                'featured' => (bool) ($p['featured'] ?? false),
            ])->values()->all();
    }

    public function customConfig(): array
    {
        $c = config('payments.custom');

        return [
            'enabled' => (bool) $c['enabled'],
            'min' => $c['min'],
            'max' => $c['max'],
            'coins_per_unit' => $c['coins_per_unit'],
            'min_formatted' => Money::format($c['min']),
            'max_formatted' => Money::format($c['max']),
        ];
    }

    /**
     * Work out what is being bought. Custom amounts are in minor units.
     *
     * @return array{package: string, coins: int, bonus: int, amount: int, description: string}
     */
    public function quote(string $package, ?int $customAmount = null): array
    {
        if ($package === 'custom') {
            $c = config('payments.custom');
            if (! $c['enabled']) {
                throw ValidationException::withMessages(['package' => 'Custom amounts are not available.']);
            }
            if ($customAmount === null || $customAmount < $c['min'] || $customAmount > $c['max']) {
                throw ValidationException::withMessages([
                    'amount' => 'Choose an amount between '.Money::format($c['min']).' and '.Money::format($c['max']).'.',
                ]);
            }
            $coins = (int) floor($customAmount / 100 * $c['coins_per_unit']);

            return [
                'package' => 'custom',
                'coins' => $coins,
                'bonus' => 0,
                'amount' => $customAmount,
                'description' => number_format($coins).' coins (custom amount)',
            ];
        }

        $p = config("payments.packages.{$package}");
        if (! $p) {
            throw ValidationException::withMessages(['package' => 'Please choose a coin package.']);
        }
        $total = $p['coins'] + ($p['bonus'] ?? 0);

        return [
            'package' => $package,
            'coins' => $p['coins'],
            'bonus' => $p['bonus'] ?? 0,
            'amount' => $p['price'],
            'description' => $p['name'].' - '.number_format($total).' coins',
        ];
    }

    public function create(User $user, array $quote, Request $request): Payment
    {
        if (! $user->hasCompleteBillingProfile()) {
            throw ValidationException::withMessages([
                'billing' => 'Please complete your personal and billing details in your account before topping up.',
            ]);
        }

        $billing = $user->billingDetails();

        return Payment::create([
            'user_id' => $user->id,
            'gateway' => $this->gateways->defaultKey(),
            'status' => Payment::PENDING,
            'package' => $quote['package'],
            'coins' => $quote['coins'],
            'bonus_coins' => $quote['bonus'],
            'amount' => $quote['amount'],
            'currency' => config('payments.currency'),
            'description' => $quote['description'],
            'billing_first_name' => $billing['first_name'],
            'billing_last_name' => $billing['last_name'],
            'billing_email' => $billing['email'],
            'billing_phone' => $billing['phone'],
            'billing_date_of_birth' => $billing['date_of_birth'],
            'billing_address_line' => $billing['address_line'],
            'billing_city' => $billing['city'],
            'billing_country' => $billing['country'],
            'billing_postcode' => $billing['postcode'],
            'terms_accepted_at' => now(),
            'immediate_supply_consent_at' => now(),
            'ip' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 500),
        ]);
    }

    /** Send the payment to the provider and return the checkout URL. */
    public function checkout(Payment $payment): string
    {
        $session = $this->gateways->get($payment->gateway)->createCheckout($payment);

        if ($session->reference) {
            $payment->update(['gateway_reference' => $session->reference]);
        }

        return $session->redirectUrl;
    }

    /**
     * Mark a payment as paid, credit the coins, issue the invoice and email the
     * receipt. Safe to call many times (webhook retries, return URL + webhook):
     * only the first call does anything.
     */
    public function markPaid(Payment $payment, ?string $reference = null, array $meta = []): bool
    {
        $transitioned = DB::transaction(function () use ($payment, $reference, $meta) {
            $locked = Payment::query()->whereKey($payment->getKey())->lockForUpdate()->firstOrFail();

            if ($locked->status === Payment::PAID || $locked->status === Payment::REFUNDED) {
                return false;
            }

            $locked->fill([
                'status' => Payment::PAID,
                'paid_at' => now(),
                'failed_at' => null,
                'failure_reason' => null,
                'gateway_reference' => $reference ?: $locked->gateway_reference,
                'meta' => array_merge($locked->meta ?? [], $meta),
            ])->save();

            if ($locked->user) {
                $this->wallet->credit($locked->user, $locked->totalCoins(), CoinTransaction::TOP_UP, 'Top-up: '.$locked->description, $locked);
            }

            $this->invoices->issue($locked);

            return true;
        }, 5);

        $payment->refresh();

        if ($transitioned) {
            $this->sendReceipt($payment);
        }

        return $transitioned;
    }

    public function markFailed(Payment $payment, string $status = Payment::FAILED, ?string $reason = null): void
    {
        DB::transaction(function () use ($payment, $status, $reason) {
            $locked = Payment::query()->whereKey($payment->getKey())->lockForUpdate()->firstOrFail();
            if ($locked->status !== Payment::PENDING) {
                return;
            }
            $locked->update([
                'status' => $status,
                'failed_at' => now(),
                'failure_reason' => $reason ? substr($reason, 0, 250) : null,
            ]);
        }, 5);

        $payment->refresh();
    }

    /** Record a refund made at the provider: the purchased coins are removed (as far as the balance allows). */
    public function markRefunded(Payment $payment): void
    {
        DB::transaction(function () use ($payment) {
            $locked = Payment::query()->whereKey($payment->getKey())->lockForUpdate()->firstOrFail();
            if ($locked->status !== Payment::PAID) {
                return;
            }
            $locked->update(['status' => Payment::REFUNDED, 'refunded_at' => now()]);

            if ($locked->user) {
                $take = min($locked->user->coins, $locked->totalCoins());
                if ($take > 0) {
                    $this->wallet->debit($locked->user, $take, CoinTransaction::REFUND, 'Refund: '.$locked->description, $locked);
                }
            }
        }, 5);

        $payment->refresh();
    }

    public function apply(Payment $payment, WebhookResult $result): void
    {
        match ($result->status) {
            Payment::PAID => $this->markPaid($payment, $result->reference, ['webhook' => $result->raw]),
            Payment::FAILED, Payment::CANCELLED => $this->markFailed($payment, $result->status, $result->failureReason),
            Payment::REFUNDED => $this->markRefunded($payment),
            default => null,
        };
    }

    public function handleWebhook(string $gatewayKey, Request $request): ?Payment
    {
        $result = $this->gateways->get($gatewayKey)->parseWebhook($request);

        if (! $result->paymentUuid && ! $result->reference) {
            Log::warning('Webhook without a payment identifier', ['gateway' => $gatewayKey]);

            return null;
        }

        $payment = Payment::query()
            ->where('gateway', $gatewayKey)
            ->where(function ($q) use ($result) {
                $q->when($result->paymentUuid, fn ($q) => $q->orWhere('uuid', $result->paymentUuid))
                    ->when($result->reference, fn ($q) => $q->orWhere('gateway_reference', $result->reference));
            })
            ->first();

        if (! $payment) {
            Log::warning('Webhook for unknown payment', ['gateway' => $gatewayKey, 'uuid' => $result->paymentUuid, 'reference' => $result->reference]);

            return null;
        }

        $this->apply($payment, $result);

        return $payment->refresh();
    }

    /** Called when the customer returns from the provider. */
    public function syncOnReturn(Payment $payment): void
    {
        if (! $payment->isPending()) {
            return;
        }

        $result = rescue(fn () => $this->gateways->get($payment->gateway)->fetchStatus($payment), null, report: true);
        if ($result) {
            $this->apply($payment, $result);
        }
    }

    private function sendReceipt(Payment $payment): void
    {
        $payment->loadMissing('invoice', 'user');
        if (! $payment->invoice) {
            return;
        }

        rescue(fn () => Mail::to($payment->billing_email, trim($payment->billing_first_name.' '.$payment->billing_last_name))
            ->send(new TopUpReceiptMail($payment)));
    }
}
