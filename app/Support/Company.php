<?php

namespace App\Support;

/** The merchant of record, as configured in config/company.php (.env). */
class Company
{
    public static function details(): array
    {
        $c = config('company');

        return [
            'brand' => config('app.name'),
            'name' => $c['name'],
            'number' => $c['number'],
            'vat_number' => $c['vat_number'],
            'address' => $c['address'],
            'country' => $c['country'],
            'email' => $c['email'],
            'phone' => $c['phone'],
            'support_hours' => $c['support_hours'],
            'jurisdiction' => $c['jurisdiction'],
            'dpa' => $c['dpa'],
            'descriptor' => $c['descriptor'],
            'website' => rtrim($c['website'], '/'),
        ];
    }

    /** One-line legal identification used in footers and documents. */
    public static function oneLiner(): string
    {
        $c = self::details();
        $parts = array_filter([
            $c['name'],
            $c['number'] ? 'Reg. No. '.$c['number'] : null,
            $c['vat_number'] ? 'VAT '.$c['vat_number'] : null,
            trim($c['address'].($c['country'] ? ', '.$c['country'] : ''), ', '),
        ]);

        return implode(' · ', $parts);
    }
}
