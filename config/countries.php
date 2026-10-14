<?php

/*
|--------------------------------------------------------------------------
| Restricted countries
|--------------------------------------------------------------------------
|
| ISO 3166-1 alpha-2 codes of countries we do not accept customers from
| (sanctions and acquirer restrictions). They are removed from the country
| list at registration and rejected by server-side validation.
|
*/

return [
    'excluded' => [
        'SD', // Sudan
        'CD', // Democratic Republic of the Congo
        'IR', // Iran
        'ML', // Mali
        'MM', // Myanmar (Burma)
        'KP', // North Korea
        'SS', // South Sudan
        'SY', // Syria
        'YE', // Yemen
        'AF', // Afghanistan
        'BY', // Belarus
        'CF', // Central African Republic
        'CU', // Cuba
        'HT', // Haiti
        'IQ', // Iraq
        'RU', // Russia
        'SO', // Somalia
        'VE', // Venezuela
        'ZW', // Zimbabwe
    ],
];
