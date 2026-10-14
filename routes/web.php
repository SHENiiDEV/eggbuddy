<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\DemoCheckoutController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\LegalController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PlayController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\TopUpController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');

// Customer-facing policies (public, linked from the footer and the sign-up form).
Route::get('/legal/{document}', [LegalController::class, 'show'])->name('legal.show');
Route::get('/legal/{document}/pdf', [LegalController::class, 'pdf'])->name('legal.pdf');

Route::middleware('guest')->group(function () {
    Route::get('/register', [RegisterController::class, 'create'])->name('register');
    Route::post('/register', [RegisterController::class, 'store'])->middleware('throttle:10,1');

    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store']);

    Route::get('/forgot-password', [PasswordResetController::class, 'request'])->name('password.request');
    Route::post('/forgot-password', [PasswordResetController::class, 'email'])->middleware('throttle:5,1')->name('password.email');
    Route::get('/reset-password/{token}', [PasswordResetController::class, 'edit'])->name('password.reset');
    Route::post('/reset-password', [PasswordResetController::class, 'update'])->name('password.update');
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');

    // The pet
    Route::get('/play', [PlayController::class, 'show'])->name('play');
    Route::prefix('play')->name('play.')->middleware('throttle:120,1')->group(function () {
        Route::get('/state', [PlayController::class, 'refresh'])->name('state');
        Route::post('/act', [PlayController::class, 'act'])->name('act');
        Route::post('/use', [PlayController::class, 'useItem'])->name('use');
        Route::post('/name', [PlayController::class, 'name'])->name('name');
        Route::post('/new-egg', [PlayController::class, 'newEgg'])->name('new-egg');
        Route::post('/game/start', [PlayController::class, 'startGame'])->name('game.start');
        Route::post('/game/guess', [PlayController::class, 'guess'])->name('game.guess');
    });

    // Shop (coins -> skins & treats)
    Route::get('/shop', [ShopController::class, 'index'])->name('shop');
    Route::post('/shop/skins', [ShopController::class, 'buySkin'])->name('shop.skins.buy');
    Route::post('/shop/skins/equip', [ShopController::class, 'equipSkin'])->name('shop.skins.equip');
    Route::post('/shop/items', [ShopController::class, 'buyItem'])->name('shop.items.buy');

    // Top up (money -> coins)
    Route::get('/top-up', [TopUpController::class, 'index'])->name('top-up');
    Route::post('/top-up', [TopUpController::class, 'store'])->middleware('throttle:10,1')->name('top-up.store');
    Route::get('/payments/{payment}', [PaymentController::class, 'show'])->name('payments.show');
    Route::get('/payments/{payment}/status', [PaymentController::class, 'status'])->name('payments.status');
    Route::get('/invoices/{invoice}', [PaymentController::class, 'invoice'])->name('invoices.download');

    // Built-in test gateway (signed links only)
    Route::get('/checkout/demo/{payment}', [DemoCheckoutController::class, 'show'])->middleware('signed')->name('payments.demo.show');
    Route::post('/checkout/demo/{payment}', [DemoCheckoutController::class, 'complete'])->middleware('signed')->name('payments.demo.complete');

    // Account
    Route::get('/account', [AccountController::class, 'show'])->name('account');
    Route::put('/account', [AccountController::class, 'update'])->name('account.update');
    Route::put('/account/password', [AccountController::class, 'password'])->name('account.password');
    Route::get('/account/payments', [AccountController::class, 'payments'])->name('account.payments');
    Route::delete('/account', [AccountController::class, 'destroy'])->name('account.destroy');
});

// Payment provider notifications (server-to-server, CSRF-exempt in bootstrap/app.php).
Route::post('/webhooks/{gateway}', [PaymentController::class, 'webhook'])
    ->where('gateway', '[a-z0-9_-]+')
    ->middleware('throttle:120,1')
    ->name('webhooks');
