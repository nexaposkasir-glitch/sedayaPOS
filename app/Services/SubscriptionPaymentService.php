<?php

namespace App\Services;

use App\Exceptions\PaymentGatewayException;
use App\Mail\PaymentReceipt;
use App\Models\PaymentSetting;
use App\Models\Plan;
use App\Models\Store;
use App\Models\SubscriptionPayment;
use App\Services\Payments\MidtransGateway;
use App\Services\Payments\XenditGateway;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class SubscriptionPaymentService
{
    public function __construct(
        private MidtransGateway $midtransGateway,
        private XenditGateway $xenditGateway
    ) {}

    /**
     * Create a subscription payment.
     */
    public function createPayment(Store $store, Plan $plan, string $gateway, int $durationMonths = 1): SubscriptionPayment
    {
        $paymentSetting = PaymentSetting::withoutGlobalScopes()->first();
        if (! $paymentSetting) {
            throw new PaymentGatewayException('Pengaturan pembayaran belum dikonfigurasi.');
        }

        $amount = $plan->monthly_price * $durationMonths;

        return DB::transaction(function () use ($store, $plan, $gateway, $amount, $paymentSetting) {
            $externalId = 'SUB-'.Str::upper(Str::random(16));

            $payment = SubscriptionPayment::create([
                'store_id' => $store->id,
                'plan_id' => $plan->id,
                'gateway' => $gateway,
                'external_id' => $externalId,
                'amount' => (int) $amount,
                'status' => SubscriptionPayment::STATUS_PENDING,
                'expires_at' => now()->addDay(),
            ]);

            $result = match ($gateway) {
                PaymentSetting::GATEWAY_MIDTRANS => $this->createMidtransCharge($payment, $store, $plan, $externalId, $amount, $paymentSetting),
                PaymentSetting::GATEWAY_XENDIT => $this->createXenditInvoice($payment, $store, $plan, $externalId, $amount, $paymentSetting),
                default => throw new PaymentGatewayException("Gateway {$gateway} belum didukung untuk subscription."),
            };

            $payment->update([
                'external_id' => $result['reference'],
                'payment_url' => $result['payment_url'],
                'payment_data' => $result['raw'] ?? null,
            ]);

            return $payment;
        });
    }

    /**
     * Confirm subscription payment via webhook.
     */
    public function confirmPayment(string $externalId): SubscriptionPayment
    {
        $payment = SubscriptionPayment::where('external_id', $externalId)
            ->where('status', SubscriptionPayment::STATUS_PENDING)
            ->first();

        if (! $payment) {
            throw new PaymentGatewayException("Pembayaran dengan ID {$externalId} tidak ditemukan atau sudah diproses.");
        }

        return DB::transaction(function () use ($payment) {
            $payment->markAsPaid();

            $store = $payment->store;
            $plan = $payment->plan;
            $durationMonths = $payment->duration_months ?? 1;

            $store->activateSubscription($plan, $durationMonths);

            // Re-enable auto_renew after successful payment
            $store->auto_renew = true;
            $store->save();

            // Send receipt email
            try {
                if ($store->email) {
                    Mail::to($store->email)->send(new PaymentReceipt($store, $payment));
                }
            } catch (\Exception $e) {
                // Silently fail email - don't block payment confirmation
                Log::warning('Failed to send payment receipt email', [
                    'payment_id' => $payment->id,
                    'error' => $e->getMessage(),
                ]);
            }

            return $payment;
        });
    }

    /**
     * Create Midtrans Snap charge for subscription.
     */
    private function createMidtransCharge(SubscriptionPayment $payment, Store $store, Plan $plan, string $externalId, int $amount, PaymentSetting $paymentSetting): array
    {
        $config = $paymentSetting->midtransConfig();

        if (! ($config['enabled'] ?? false)) {
            throw new PaymentGatewayException('Midtrans tidak aktif atau belum dikonfigurasi.');
        }

        $endpoint = $config['is_production'] ?? false
            ? 'https://app.midtrans.com/snap/v1/transactions'
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

        $payload = [
            'transaction_details' => [
                'order_id' => $externalId,
                'gross_amount' => $amount,
            ],
            'item_details' => [
                [
                    'id' => 'plan-'.$plan->id,
                    'price' => $amount,
                    'quantity' => 1,
                    'name' => "Langganan {$plan->name} - {$store->name}",
                ],
            ],
            'customer_details' => [
                'first_name' => $store->name,
                'email' => $store->email ?? config('mail.from.address'),
                'phone' => $store->phone,
            ],
            'callbacks' => [
                'finish' => route('subscription.index'),
            ],
        ];

        $response = \Illuminate\Support\Facades\Http::withBasicAuth($config['server_key'], '')
            ->post($endpoint, $payload);

        if ($response->failed()) {
            throw new PaymentGatewayException(
                'Midtrans error: '.$response->json('status_message', $response->body())
            );
        }

        return [
            'reference' => $response->json('order_id', $externalId),
            'payment_url' => $response->json('redirect_url'),
            'token' => $response->json('token'),
            'raw' => $response->json(),
        ];
    }

    /**
     * Create Xendit invoice for subscription.
     */
    private function createXenditInvoice(SubscriptionPayment $payment, Store $store, Plan $plan, string $externalId, int $amount, PaymentSetting $paymentSetting): array
    {
        $config = $paymentSetting->xenditConfig();

        if (! ($config['enabled'] ?? false)) {
            throw new PaymentGatewayException('Xendit tidak aktif atau belum dikonfigurasi.');
        }

        $response = \Illuminate\Support\Facades\Http::withBasicAuth($config['secret_key'], '')
            ->post('https://api.xendit.co/v2/invoices', [
                'external_id' => $externalId,
                'amount' => $amount,
                'description' => "Langganan {$plan->name} - {$store->name}",
                'customer' => [
                    'given_names' => $store->name,
                    'email' => $store->email ?? config('mail.from.address'),
                    'mobile_number' => $store->phone,
                ],
                'success_redirect_url' => route('subscription.index'),
                'items' => [
                    [
                        'name' => "Langganan {$plan->name}",
                        'quantity' => 1,
                        'price' => $amount,
                    ],
                ],
            ]);

        if ($response->failed()) {
            throw new PaymentGatewayException(
                'Xendit error: '.$response->json('message', $response->body())
            );
        }

        return [
            'reference' => $response->json('id'),
            'payment_url' => $response->json('invoice_url'),
            'raw' => $response->json(),
        ];
    }
}
