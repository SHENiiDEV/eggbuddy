<?php

namespace App\Http\Middleware;

use App\Support\Company;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'app' => [
                'name' => config('app.name'),
                'currency' => config('payments.currency'),
            ],
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'email' => $user->email,
                    'coins' => (int) $user->coins,
                    'pet_skin' => $user->pet_skin,
                    'shell_skin' => $user->shell_skin,
                ] : null,
            ],
            'company' => fn () => Company::details(),
            'legal' => fn () => [
                'version' => config('legal.version'),
                'effective_date' => config('legal.effective_date'),
                'documents' => collect(config('legal.documents'))
                    ->map(fn ($title, $key) => ['key' => $key, 'title' => $title, 'url' => route('legal.show', $key)])
                    ->values(),
            ],
            'toast' => fn () => array_filter([
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ]) ?: null,
        ];
    }
}
