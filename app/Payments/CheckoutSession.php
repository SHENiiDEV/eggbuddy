<?php

namespace App\Payments;

final class CheckoutSession
{
    public function __construct(
        public readonly string $redirectUrl,
        public readonly ?string $reference = null,
    ) {}
}
