<?php

namespace App\Payments\Gateways;

use App\Models\Payment;
use App\Payments\CheckoutSession;
use App\Payments\Contracts\PaymentGateway;
use App\Payments\WebhookResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * Built-in test gateway. It sends the customer to a clearly labelled test page
 * inside this app where the payment can be approved or declined. No card data
 * is collected and no money moves. Disable it in production.
 */
class DemoGateway implements PaymentGateway
{
    public function __construct(private readonly array $config = [], private readonly string $key = 'demo') {}

    public function createCheckout(Payment $payment): CheckoutSession
    {
        $reference = 'demo_'.Str::lower(Str::random(16));

        $url = URL::temporarySignedRoute('payments.demo.show', now()->addMinutes(30), ['payment' => $payment->uuid]);

        return new CheckoutSession($url, $reference);
    }

    public function parseWebhook(Request $request): WebhookResult
    {
        $signature = (string) $request->header('X-Demo-Signature');
        if (! hash_equals(self::sign($request->getContent(), $this->secret()), $signature)) {
            throw new AccessDeniedHttpException('Invalid webhook signature.');
        }

        $payload = $request->json()->all();

        return new WebhookResult(
            status: (string) ($payload['status'] ?? ''),
            paymentUuid: $payload['payment_id'] ?? null,
            reference: $payload['reference'] ?? null,
            failureReason: $payload['reason'] ?? null,
            raw: $payload,
        );
    }

    public function fetchStatus(Payment $payment): ?WebhookResult
    {
        return null;
    }

    public function isTestMode(): bool
    {
        return true;
    }

    public function secret(): string
    {
        return (string) ($this->config['webhook_secret'] ?? '');
    }

    public static function sign(string $body, string $secret): string
    {
        return hash_hmac('sha256', $body, $secret);
    }
}
