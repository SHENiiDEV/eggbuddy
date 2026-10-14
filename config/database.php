<?php

/*
|--------------------------------------------------------------------------
| SQLite tuned for production
|--------------------------------------------------------------------------
|
| The web server (php-fpm) and the queue worker write to the same SQLite
| file at the same time. WAL lets readers and a writer work in parallel,
| busy_timeout makes a request wait for a lock instead of failing with
| "database is locked", and IMMEDIATE transactions take the write lock up
| front so concurrent payment/coin transactions queue up safely.
|
| Other connections (mysql, pgsql...) keep Laravel's defaults.
|
*/

return [

    'connections' => [

        'sqlite' => [
            'driver' => 'sqlite',
            'url' => env('DB_URL'),
            'database' => env('DB_DATABASE', database_path('database.sqlite')),
            'prefix' => '',
            'prefix_indexes' => null,
            'mask_bindings_in_exception_messages' => env('DB_MASK_BINDINGS', false),
            'foreign_key_constraints' => env('DB_FOREIGN_KEYS', true),
            'busy_timeout' => (int) env('DB_BUSY_TIMEOUT', 10000),
            'journal_mode' => env('DB_JOURNAL_MODE', 'wal'),
            'synchronous' => env('DB_SYNCHRONOUS', 'normal'),
            'transaction_mode' => env('DB_TRANSACTION_MODE', 'IMMEDIATE'),
            'pragmas' => [],
        ],

    ],

];
