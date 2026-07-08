<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPayment;
use App\Services\SubscriptionPaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SubscriptionWebhookController extends Controller
{
    /**
     * Handle Midtrans subscription payment notification.
     */
    public function midtrans(Request $request, SubscriptionPaymentService $paymentService)
    {
        $payload = $request->all();

        Log::info('Midtrans subscription webhook received', $payload);

        $orderId = $payload['order_id'] ?? null;
        $transactionStatus = $payload['transaction_status'] ?? null;
        $fraudStatus = $payload['fraud_status'] ?? 'accept';

        if (! $orderId) {
            return response()->json(['message' => 'Missing order_id'], 400);
        }

        $payment = SubscriptionPayment::where('external_id', $orderId)->first();
        if (! $payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        if ($payment->isPaid()) {
            return response()->json(['message' => 'Already processed'], 200);
        }

        if ($transactionStatus === 'capture' && $fraudStatus === 'accept') {
            $paymentService->confirmPayment($orderId);
        } elseif ($transactionStatus === 'settlement') {
            $paymentService->confirmPayment($orderId);
        } elseif (in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
            $payment->markAsFailed();
        }

        return response()->json(['message' => 'OK']);
    }

    /**
     * Handle Xendit subscription invoice callback.
     */
    public function xendit(Request $request, SubscriptionPaymentService $paymentService)
    {
        $payload = $request->all();

        Log::info('Xendit subscription webhook received', $payload);

        $externalId = $payload['external_id'] ?? null;
        $status = $payload['status'] ?? null;

        if (! $externalId) {
            return response()->json(['message' => 'Missing external_id'], 400);
        }

        $payment = SubscriptionPayment::where('external_id', $externalId)->first();
        if (! $payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        if ($payment->isPaid()) {
            return response()->json(['message' => 'Already processed'], 200);
        }

        if ($status === 'PAID' || $status === 'SETTLED') {
            $paymentService->confirmPayment($externalId);
        } elseif ($status === 'EXPIRED') {
            $payment->markAsExpired();
        }

        return response()->json(['message' => 'OK']);
    }
}
