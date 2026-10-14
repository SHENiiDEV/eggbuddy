<?php

namespace App\Providers;

use App\Payments\GatewayManager;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(GatewayManager::class);
    }

    public function boot(): void
    {
        Model::preventSilentlyDiscardingAttributes(! $this->app->isProduction());

        Password::defaults(fn () => Password::min(8)->letters()->numbers());

        Vite::prefetch(concurrency: 3);
    }
}
