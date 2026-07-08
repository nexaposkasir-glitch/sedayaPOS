<?php

namespace App\Console\Commands;

use App\Mail\SubscriptionExpiring;
use App\Models\Store;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class NotifySubscriptionExpiring extends Command
{
    protected $signature = 'subscription:notify-expiring';
    protected $description = 'Send expiry warnings for active subscriptions (7, 3, 1 days before end).';

    public function handle(): int
    {
        foreach ([7, 3, 1] as $daysBefore) {
            $stores = Store::where('subscription_status', 'active')
                ->where('parent_store_id', null) // only parent stores
                ->whereNotNull('subscription_ends_at')
                ->whereDate('subscription_ends_at', now()->addDays($daysBefore)->toDateString())
                ->get();

            foreach ($stores as $store) {
                if ($store->email) {
                    Mail::to($store->email)->send(
                        new SubscriptionExpiring($store, $daysBefore)
                    );

                    $this->info("Expiry notification sent to {$store->name} ({$daysBefore} hari).");
                }
            }
        }

        $this->info('Done.');

        return self::SUCCESS;
    }
}
