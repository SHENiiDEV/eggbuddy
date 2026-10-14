<?php

/*
|--------------------------------------------------------------------------
| Merchant of record
|--------------------------------------------------------------------------
|
| Card schemes require the merchant's legal name, registration number,
| permanent address and customer-service contacts to be visible on the
| website, on receipts and in the customer-facing policies. Everything
| below is pulled into the footer, legal pages, emails and invoices.
|
*/

return [
    'name' => env('COMPANY_NAME', 'Your Company Ltd'),
    'number' => env('COMPANY_NUMBER', ''),
    'vat_number' => env('COMPANY_VAT_NUMBER', ''),
    'address' => env('COMPANY_ADDRESS', ''),
    'country' => env('COMPANY_COUNTRY', ''),
    'email' => env('COMPANY_EMAIL', 'support@example.com'),
    'phone' => env('COMPANY_PHONE', ''),
    'support_hours' => env('COMPANY_SUPPORT_HOURS', 'Monday to Friday, 9:00-18:00 CET'),
    'jurisdiction' => env('COMPANY_JURISDICTION', 'the country of registration of the Company'),
    'dpa' => env('COMPANY_DPA', ''),
    'descriptor' => env('COMPANY_DESCRIPTOR', 'EGGBUDDY'),
    'website' => env('APP_URL', 'http://localhost'),
];
