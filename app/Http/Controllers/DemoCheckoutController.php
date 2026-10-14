<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Payments\PaymentService;
use App\Support\Countries;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The hosted page of the built-in test gateway. Only reachable through a
 * signed link created by DemoGateway, and only while the demo gateway is enabled.
 */
class DemoCheckoutController extends Controller
{
    public function show(Request $request, Payment $payment): Response|RedirectResponse
    {
        $this->guard($request, $payment);

        if (! $payment->isPending()) {
            return redirect()->route('payments.show', $payment);
        }

        return Inertia::render('Payments/DemoCheckout', [
            'payment' => $payment->toFrontend(),
            'billing' => [
                'name' => $payment->billing_first_name.' '.$payment->billing_last_name,
                'email' => $payment->billing_email,
                'address' => $payment->billing_address_line.', '.$payment->billing_postcode.' '.$payment->billing_city.', '.Countries::name($payment->billing_country),
            ],
            'completeUrl' => URL::temporarySignedRoute('payments.demo.complete', now()->addMinutes(30), ['payment' => $payment->uuid]),
        ]);
    }

    public function complete(Request $request, Payment $payment, PaymentService $payments): RedirectResponse
    {
        $this->guard($request, $payment);
        $data = $request->validate(['outcome' => ['required', Rule::in(['approve', 'decline', 'cancel'])]]);

        match ($data['outcome']) {
            'approve' => $payments->markPaid($payment, $payment->gateway_reference, ['demo' => true]),
            'decline' => $payments->markFailed($payment, Payment::FAILED, 'Declined by card issuer (test)'),
            'cancel' => $payments->markFailed($payment, Payment::CANCELLED, 'Cancelled by customer'),
        };

        return redirect()->route('payments.show', $payment);
    }

    private function guard(Request $request, Payment $payment): void
    {
        abort_unless(config('payments.gateways.demo.enabled') && $payment->gateway === 'demo', 404);
        abort_unless($payment->user_id === $request->user()->id, 404);
    }
}
