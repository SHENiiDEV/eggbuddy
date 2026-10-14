<?php

namespace Tests\Feature;

use App\Mail\TopUpReceiptMail;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\User;
use App\Payments\Gateways\DemoGateway;
use App\Payments\PaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class TopUpTest extends TestCase
{
    use RefreshDatabase;

    private function startPayment(User $user, array $data = ['package' => 'piggy']): Payment
    {
        $this->actingAs($user)
            ->post('/top-up', $data + ['accept_terms' => true, 'immediate_supply' => true], ['X-Inertia' => 'true'])
            ->assertStatus(409)
            ->assertHeader('X-Inertia-Location');

        return Payment::latest('id')->firstOrFail();
    }

    public function test_top_up_page_shows_packages_and_billing_details(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get('/top-up')->assertOk()->assertInertia(fn ($page) => $page
            ->component('TopUp/Index')
            ->has('packages', 4)
            ->where('billingComplete', true)
            ->where('testMode', true));
    }

    public function test_consents_are_required(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post('/top-up', ['package' => 'piggy'])
            ->assertSessionHasErrors(['accept_terms', 'immediate_supply']);
        $this->assertSame(0, Payment::count());
    }

    public function test_full_demo_payment_credits_coins_issues_invoice_and_emails_receipt(): void
    {
        Mail::fake();
        $user = User::factory()->create();

        $payment = $this->startPayment($user);
        $this->assertSame(Payment::PENDING, $payment->status);
        $this->assertSame(1999, $payment->amount);
        $this->assertSame($user->phone, $payment->billing_phone);
        $this->assertNotNull($payment->immediate_supply_consent_at);

        $url = URL::temporarySignedRoute('payments.demo.complete', now()->addMinutes(5), ['payment' => $payment->uuid]);
        $this->post($url, ['outcome' => 'approve'])->assertRedirect(route('payments.show', $payment));

        $payment->refresh();
        $this->assertSame(Payment::PAID, $payment->status);
        $this->assertSame(2400, $user->refresh()->coins);

        $invoice = $payment->invoice;
        $this->assertNotNull($invoice);
        $this->assertMatchesRegularExpression('/^EB-\d{4}-000001$/', $invoice->number);
        $this->assertSame(1999, $invoice->total);

        Mail::assertQueued(TopUpReceiptMail::class, fn (TopUpReceiptMail $m) => $m->hasTo($user->email) && count($m->attachments()) === 1);

        $this->get(route('invoices.download', $invoice))
            ->assertOk()
            ->assertHeader('Content-Type', 'application/pdf');
    }

    public function test_marking_paid_twice_credits_once(): void
    {
        Mail::fake();
        $user = User::factory()->create();
        $payment = $this->startPayment($user);

        $service = app(PaymentService::class);
        $this->assertTrue($service->markPaid($payment));
        $this->assertFalse($service->markPaid($payment));

        $this->assertSame(2400, $user->refresh()->coins);
        $this->assertSame(1, Invoice::count());
        Mail::assertQueuedCount(1);
    }

    public function test_declined_payment_gives_no_coins(): void
    {
        $user = User::factory()->create();
        $payment = $this->startPayment($user);

        $url = URL::temporarySignedRoute('payments.demo.complete', now()->addMinutes(5), ['payment' => $payment->uuid]);
        $this->post($url, ['outcome' => 'decline']);

        $this->assertSame(Payment::FAILED, $payment->refresh()->status);
        $this->assertSame(0, $user->refresh()->coins);
        $this->assertNull($payment->invoice);
    }

    public function test_custom_amount_is_validated_and_priced(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post('/top-up', ['package' => 'custom', 'amount' => 100, 'accept_terms' => true, 'immediate_supply' => true])
            ->assertSessionHasErrors('amount');

        $payment = $this->startPayment($user, ['package' => 'custom', 'amount' => 1250]);
        $this->assertSame(1250, $payment->amount);
        $this->assertSame(1250, $payment->coins);
    }

    public function test_signed_webhook_marks_payment_paid_and_bad_signature_is_rejected(): void
    {
        Mail::fake();
        $user = User::factory()->create();
        $payment = $this->startPayment($user);

        $body = json_encode(['payment_id' => $payment->uuid, 'status' => 'paid', 'reference' => 'psp_123']);

        $this->call('POST', '/webhooks/demo', [], [], [], ['CONTENT_TYPE' => 'application/json', 'HTTP_X_DEMO_SIGNATURE' => 'bad'], $body)
            ->assertForbidden();
        $this->assertSame(Payment::PENDING, $payment->refresh()->status);

        $signature = DemoGateway::sign($body, config('payments.gateways.demo.webhook_secret'));
        $this->call('POST', '/webhooks/demo', [], [], [], ['CONTENT_TYPE' => 'application/json', 'HTTP_X_DEMO_SIGNATURE' => $signature], $body)
            ->assertOk();

        $this->assertSame(Payment::PAID, $payment->refresh()->status);
        $this->assertSame('psp_123', $payment->gateway_reference);
        $this->assertSame(2400, $user->refresh()->coins);
    }

    public function test_refund_webhook_removes_coins(): void
    {
        Mail::fake();
        $user = User::factory()->create();
        $payment = $this->startPayment($user);
        app(PaymentService::class)->markPaid($payment);

        $body = json_encode(['payment_id' => $payment->uuid, 'status' => 'refunded']);
        $signature = DemoGateway::sign($body, config('payments.gateways.demo.webhook_secret'));
        $this->call('POST', '/webhooks/demo', [], [], [], ['CONTENT_TYPE' => 'application/json', 'HTTP_X_DEMO_SIGNATURE' => $signature], $body)->assertOk();

        $this->assertSame(Payment::REFUNDED, $payment->refresh()->status);
        $this->assertSame(0, $user->refresh()->coins);
    }

    public function test_players_cannot_see_each_others_payments_or_invoices(): void
    {
        Mail::fake();
        $owner = User::factory()->create();
        $payment = $this->startPayment($owner);
        app(PaymentService::class)->markPaid($payment);

        $other = User::factory()->create();
        $this->actingAs($other)->get(route('payments.show', $payment))->assertNotFound();
        $this->actingAs($other)->get(route('invoices.download', $payment->invoice))->assertNotFound();
    }

    public function test_demo_checkout_requires_a_valid_signature(): void
    {
        $user = User::factory()->create();
        $payment = $this->startPayment($user);

        $this->get('/checkout/demo/'.$payment->uuid)->assertForbidden();
    }

    public function test_closing_an_account_keeps_payment_records(): void
    {
        Mail::fake();
        $user = User::factory()->create(['password' => 'secret123']);
        $payment = $this->startPayment($user);
        app(PaymentService::class)->markPaid($payment);

        $this->actingAs($user)->delete('/account', ['password' => 'secret123', 'confirm' => true])->assertRedirect('/');

        $this->assertNull(User::find($user->id));
        $this->assertNull($payment->refresh()->user_id);
        $this->assertSame(1, Invoice::count());
    }
}
