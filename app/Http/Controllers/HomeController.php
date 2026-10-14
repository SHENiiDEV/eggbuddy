<?php

namespace App\Http\Controllers;

use App\Game\Shop;
use App\Payments\PaymentService;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(Shop $shop, PaymentService $payments): Response
    {
        return Inertia::render('Home', [
            'skins' => $shop->skinsCatalogue(),
            'items' => $shop->itemsCatalogue(),
            'packages' => $payments->packages(),
            'custom' => $payments->customConfig(),
            'game' => [
                'starter_coins' => (int) config('game.starter_coins'),
                'hatch_seconds' => (int) config('game.hatch_seconds'),
                'stages' => config('game.stages'),
                'daily_coin_cap' => (int) config('game.minigame.daily_coin_cap'),
            ],
        ]);
    }
}
