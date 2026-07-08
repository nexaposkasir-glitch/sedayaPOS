<?php

namespace App\Console\Commands;

use App\Mail\SubscriptionExpiring;
use App\Models\Plan;
use App\Models\Store;
use App\Models\SubscriptionPayment;
use App\Services\SubscriptionPaymentService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class ProcessSubscriptionRenewals extends Command
{
    protected $signature = 'subscription:process-renewals';
    protected $description = 'Auto-renew subscriptions by creating payment invoices for stores ending within 3 days.';

    public function handle(): int
    {
        $stores = Store::with('plan')
            ->where('subscription_status', 'active')
            ->where('auto_renew', true)
            ->where('parent_store_id', null) // only parent stores, not branches
            ->whereNotNull('subscription_ends_at')
            ->whereDate('subscription_ends_at', '<=', now()->addDays(3))
            ->whereDate('subscription_ends_at', '>', now()->subDay())
            ->get();

        if ($stores->isEmpty()) {
            $this->info('No subscriptions due for renewal.');

            return self::SUCCESS;
        }

        $defaultPlan = Plan::default();

        foreach ($stores as $store) {
            $plan = $store->effectivePlan() ?? $defaultPlan;

            if (! $plan) {
                $this->warn("Store {$store->name}: no plan found, skipping.");
                continue;
            }

            // Check if there's already a pending payment for this store
            $existing = SubscriptionPayment::where('store_id', $store->id)
                ->where('status', SubscriptionPayment::STATUS_PENDING)
                ->exists();

            if ($existing) {
                $this->info("Store {$store->name}: already has a pending payment, skipping.");
                continue;
            }

            try {
                $paymentService = app(SubscriptionPaymentService::class);
                $payment = $paymentService->createPayment($store, $plan, 'midtrans', 1);

                $this->info("Store {$store->name}: renewal invoice created ({$payment->external_id}).");

                // Send email with direct payment link
                if ($store->email && $payment->payment_url) {
                    Mail::to($store->email)->send(
                        new SubscriptionExpiring($store, 3, $payment->payment_url)
                    );
                }

                // Disable auto_renew to prevent duplicate — will be re-enabled on payment success
                $store->auto_renew = false;
                $store->save();
            } catch (\Exception $e) {
                // Payment gateway might be unconfigured — send notification to pay manually
                Log::warning("Auto-renew failed for store {$store->name}", [
                    'error' => $e->getMessage(),
                ]);

                // Send manual payment notification
                if ($store->email) {
                    Mail::to($store->email)->send(
                        new SubscriptionExpiring($store, 3)
                    );
                }

                // Disable auto_renew to prevent repeated failures
                $store->auto_renew = false;
                $store->save();

                $this->warn("Store {$store->name}: auto-renew failed, sent manual notification.");
            }
        }

        $this->info("Processed {$stores->count()} renewal(s).");

        return self::SUCCESS;
    }
}
