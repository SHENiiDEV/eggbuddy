<?php

namespace App\Payments\Contracts;

use App\Models\Payment;
use App\Payments\CheckoutSession;
use App\Payments\WebhookResult;
use Illuminate\Http\Request;

/**
 * A payment service provider (PSP) driver.
 *
 * To connect a real provider: create a class implementing this interface in
 * app/Payments/Gateways, register it in config/payments.php and set
 * PAYMENT_GATEWAY. The payment record already carries the customer's full
 * billing details (name, email, phone, date of birth and address) which most
 * acquirers require for card payments and 3-D Secure.
 */
interface PaymentGateway
{
    /** Create the payment at the provider and return where to send the customer (hosted page / 3DS). */
    public function createCheckout(Payment $payment): CheckoutSession;

    /** Verify the provider's server-to-server notification and translate it. Throws on a bad signature. */
    public function parseWebhook(Request $request): WebhookResult;

    /** Ask the provider for the current status when the customer comes back. Null when unsupported. */
    public function fetchStatus(Payment $payment): ?WebhookResult;

    /** True for test gateways that never move real money. */
    public function isTestMode(): bool;
}
