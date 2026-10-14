<?php

return [
    // Shown as "Last updated" on every policy and stored against each user's acceptance.
    'effective_date' => env('LEGAL_EFFECTIVE_DATE', '2026-10-05'),
    'version' => env('LEGAL_VERSION', '1.0'),

    // Account holders must be adults because they can make card payments.
    'min_age' => (int) env('REGISTRATION_MIN_AGE', 18),

    // Customer-facing documents. Markdown sources live in resources/legal.
    'documents' => [
        'terms' => 'Terms & Conditions',
        'privacy' => 'Privacy Policy',
        'cookies' => 'Cookie Policy',
        'refunds' => 'Refund & Cancellation Policy',
    ],
];
