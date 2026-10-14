<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileRequest;
use App\Support\Countries;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function show(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Account/Profile', [
            'profile' => $user->billingDetails() + [
                'country_name' => Countries::name($user->country),
                'created_at' => $user->created_at->toIso8601String(),
                'terms_accepted_at' => $user->terms_accepted_at->toIso8601String(),
                'terms_version' => $user->terms_version,
            ],
            'countries' => Countries::options(),
            'maxBirthDate' => now()->subYears((int) config('legal.min_age'))->toDateString(),
            'stats' => [
                'coins' => (int) $user->coins,
                'pets_raised' => $user->pets()->count(),
                'skins_owned' => array_sum(array_map('count', $user->ownedSkins())),
                'payments' => $user->payments()->where('status', 'paid')->count(),
                'star_adults' => $user->pets()->where('form', 'star')->count(),
            ],
        ]);
    }

    public function update(ProfileRequest $request): RedirectResponse
    {
        $user = $request->user();
        $data = $request->validated();

        if ($data['email'] !== $user->email) {
            $user->email_verified_at = null;
        }

        $user->fill($data)->save();

        return back()->with('success', 'Your details have been saved.');
    }

    public function password(Request $request): RedirectResponse
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $request->user()->update(['password' => $request->input('password')]);

        return back()->with('success', 'Password updated.');
    }

    public function payments(Request $request): Response
    {
        $payments = $request->user()->payments()->with('invoice')->latest()->paginate(15);

        return Inertia::render('Account/Payments', [
            'payments' => $payments->through(fn ($p) => $p->toFrontend()),
            'transactions' => $request->user()->coinTransactions()->latest('id')->limit(30)->get()
                ->map(fn ($t) => [
                    'id' => $t->id,
                    'amount' => $t->amount,
                    'balance_after' => $t->balance_after,
                    'type' => $t->type,
                    'description' => $t->description,
                    'created_at' => $t->created_at->toIso8601String(),
                ]),
        ]);
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
            'confirm' => ['accepted'],
        ], ['confirm.accepted' => 'Please confirm that you understand your coins and pets will be lost.']);

        $user = $request->user();

        Auth::logout();

        // Game data is deleted with the account; payments and invoices are kept
        // (user_id set to null) because accounting law requires it.
        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home')->with('success', 'Your account has been closed. Take care!');
    }
}
