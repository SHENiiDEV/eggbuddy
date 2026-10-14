<?php

namespace Database\Seeders;

use App\Billing\Wallet;
use App\Game\PetEngine;
use App\Models\CoinTransaction;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * A ready-to-use demo account for local development only:
     * demo@eggbuddy.test / password1
     */
    public function run(): void
    {
        if (app()->isProduction() || User::where('email', 'demo@eggbuddy.test')->exists()) {
            return;
        }

        $user = User::create([
            'first_name' => 'Demo',
            'last_name' => 'Player',
            'email' => 'demo@eggbuddy.test',
            'password' => 'password1',
            'phone' => '+37120000000',
            'date_of_birth' => '1990-01-01',
            'address_line' => 'Brivibas iela 1',
            'city' => 'Riga',
            'country' => 'LV',
            'postcode' => 'LV-1010',
            'terms_accepted_at' => now(),
            'terms_version' => config('legal.version'),
            'terms_ip' => '127.0.0.1',
            'pet_skin' => config('skins.default_pet'),
            'shell_skin' => config('skins.default_shell'),
        ]);

        app(Wallet::class)->credit($user, (int) config('game.starter_coins'), CoinTransaction::STARTER, 'Welcome gift');
        app(PetEngine::class)->newEgg($user);
    }
}
