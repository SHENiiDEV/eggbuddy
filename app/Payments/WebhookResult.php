<?php

namespace App\Payments;

use App\Models\Payment;

final class WebhookResult
{
    /**
     * @param  string  $status  one of Payment::PAID, FAILED, CANCELLED, REFUNDED, PENDING
     */
    public function __construct(
        public readonly string $status,
        public readonly ?string $paymentUuid = null,
        public readonly ?string $reference = null,
        public readonly ?string $failureReason = null,
        public readonly array $raw = [],
    ) {
        if (! in_array($status, [Payment::PAID, Payment::FAILED, Payment::CANCELLED, Payment::REFUNDED, Payment::PENDING], true)) {
            throw new \InvalidArgumentException("Unknown payment status [{$status}].");
        }
    }
}
