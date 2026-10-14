<?php

namespace App\Http\Controllers\Auth;

use App\Billing\Wallet;
use App\Game\PetEngine;
use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterRequest;
use App\Mail\WelcomeMail;
use App\Models\CoinTransaction;
use App\Models\User;
use App\Support\Countries;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class RegisterController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Register', [
            'countries' => Countries::options(),
            'minAge' => (int) config('legal.min_age'),
            'maxBirthDate' => now()->subYears((int) config('legal.min_age'))->toDateString(),
            'starterCoins' => (int) config('game.starter_coins'),
        ]);
    }

    public function store(RegisterRequest $request, Wallet $wallet, PetEngine $engine): RedirectResponse
    {
        $data = $request->validated();

        $user = DB::transaction(function () use ($data, $request, $wallet, $engine) {
            $user = User::create([
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'email' => $data['email'],
                'password' => $data['password'],
                'phone' => $data['phone'],
                'date_of_birth' => $data['date_of_birth'],
                'address_line' => $data['address_line'],
                'city' => $data['city'],
                'country' => $data['country'],
                'postcode' => $data['postcode'],
                'terms_accepted_at' => now(),
                'terms_version' => config('legal.version'),
                'terms_ip' => $request->ip(),
                'pet_skin' => config('skins.default_pet'),
                'shell_skin' => config('skins.default_shell'),
                'last_login_at' => now(),
            ]);

            if (($starter = (int) config('game.starter_coins')) > 0) {
                $wallet->credit($user, $starter, CoinTransaction::STARTER, 'Welcome gift');
            }

            $engine->newEgg($user);

            return $user;
        });

        event(new Registered($user));

        // A mail outage must never block sign-up; failures are logged.
        rescue(fn () => Mail::to($user)->send(new WelcomeMail($user)));

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('play')->with('success', 'Welcome, '.$user->first_name.'! Your egg is warming up.');
    }
}
