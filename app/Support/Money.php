<?php

namespace App\Support;

class Money
{
    /** Format an amount given in minor units (cents), e.g. 1999 EUR -> "€19.99". */
    public static function format(int $minor, ?string $currency = null): string
    {
        $currency = strtoupper($currency ?: config('payments.currency', 'EUR'));
        $major = $minor / 100;

        if (class_exists(\NumberFormatter::class)) {
            $formatter = new \NumberFormatter('en_IE', \NumberFormatter::CURRENCY);
            $formatted = $formatter->formatCurrency($major, $currency);
            if ($formatted !== false) {
                return $formatted;
            }
        }

        $symbols = ['EUR' => '€', 'USD' => '$', 'GBP' => '£'];

        return ($symbols[$currency] ?? $currency.' ').number_format($major, 2);
    }

    /** Plain decimal string for documents, e.g. 1999 -> "19.99". */
    public static function decimal(int $minor): string
    {
        return number_format($minor / 100, 2, '.', '');
    }
}
