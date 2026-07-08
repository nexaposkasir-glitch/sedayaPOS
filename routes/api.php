<?php

use App\Http\Controllers\Api\PaymentWebhookController;
use App\Http\Controllers\Api\SubscriptionWebhookController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| These routes are loaded by the RouteServiceProvider and are assigned
| the "api" middleware group.
|
*/

// Payment Gateway Webhooks (no auth required)
Route::prefix('webhooks')->group(function () {
    Route::post('/midtrans', [PaymentWebhookController::class, 'midtrans'])->name('webhooks.midtrans');
    Route::post('/xendit', [PaymentWebhookController::class, 'xendit'])->name('webhooks.xendit');

    // Subscription webhooks
    Route::post('/subscription/midtrans', [SubscriptionWebhookController::class, 'midtrans'])->name('webhooks.subscription.midtrans');
    Route::post('/subscription/xendit', [SubscriptionWebhookController::class, 'xendit'])->name('webhooks.subscription.xendit');
});
