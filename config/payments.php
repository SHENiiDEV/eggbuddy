<?php

use App\Payments\Gateways\DemoGateway;

return [

    /*
    |--------------------------------------------------------------------------
    | Active gateway
    |--------------------------------------------------------------------------
    |
    | Every gateway implements App\Payments\Contracts\PaymentGateway. To plug in
    | a real PSP, add a class next to DemoGateway, register it below and set
    | PAYMENT_GATEWAY to its key. Nothing else in the app needs to change.
    |
    */

    'default' => env('PAYMENT_GATEWAY', 'demo'),

    'currency' => env('PAYMENT_CURRENCY', 'EUR'),

    'gateways' => [
        'demo' => [
            'class' => DemoGateway::class,
            // The demo gateway never charges anyone. Keep it off in production.
            'enabled' => (bool) env('PAYMENT_DEMO_ENABLED', true),
            'webhook_secret' => env('PAYMENT_DEMO_WEBHOOK_SECRET', 'change-me'),
        ],

        // 'acme' => [
        //     'class' => App\Payments\Gateways\AcmeGateway::class,
        //     'api_key' => env('ACME_API_KEY'),
        //     'webhook_secret' => env('ACME_WEBHOOK_SECRET'),
        // ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Coin packages
    |--------------------------------------------------------------------------
    |
    | Prices are in minor units (cents) and include VAT. "bonus" coins are added
    | on top of "coins". Keys are stored on payments, so do not rename them
    | once real customers have bought them.
    |
    */

    'packages' => [
        'pocket' => ['name' => 'Pocket Change', 'coins' => 500, 'bonus' => 0, 'price' => 499],
        'pouch' => ['name' => 'Coin Pouch', 'coins' => 1000, 'bonus' => 100, 'price' => 999],
        'piggy' => ['name' => 'Piggy Bank', 'coins' => 2000, 'bonus' => 400, 'price' => 1999, 'featured' => true],
        'treasure' => ['name' => 'Treasure Egg', 'coins' => 5000, 'bonus' => 1500, 'price' => 4999],
    ],

    // Free-amount top-up. Amounts in cents; coins_per_unit = coins per 1.00 of currency.
    'custom' => [
        'enabled' => true,
        'min' => 500,
        'max' => 50000,
        'coins_per_unit' => 100,
    ],

    'invoice' => [
        'prefix' => env('INVOICE_PREFIX', 'EB'),
        // Percentage already included in the price. 0 hides the VAT breakdown.
        'vat_rate' => (float) env('INVOICE_VAT_RATE', 0),
    ],

    // Unpaid checkouts older than this are shown as expired.
    'pending_expiry_minutes' => 60,
];
