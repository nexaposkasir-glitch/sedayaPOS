<?php

namespace App\Console\Commands;

use App\Mail\TrialExpiring;
use App\Models\Store;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendTrialExpirationNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscription:trial-expiring';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send trial expiration notifications to stores.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        // Send warning at 3 days and 1 day before trial ends
        foreach ([3, 1] as $daysBefore) {
            $stores = Store::with('users')
                ->where('subscription_status', 'trial')
                ->whereDate('trial_ends_at', now()->addDays($daysBefore)->toDateString())
                ->get();

            foreach ($stores as $store) {
                $storeUsers = $store->users;
                $adminEmail = $store->email;

                // Try store email first, then first admin user's email
                if ($adminEmail) {
                    Mail::to($adminEmail)->send(new TrialExpiring($store, $daysBefore));
                }

                foreach ($storeUsers as $user) {
                    if ($user->email && $user->email !== $adminEmail) {
                        // Send to first user with email (likely the owner)
                        if (!$adminEmail) {
                            Mail::to($user->email)->send(new TrialExpiring($store, $daysBefore));
                            $adminEmail = $user->email; // prevent duplicate
                        }
                    }
                }

                if ($adminEmail) {
                    $this->info("Trial notification sent to {$store->name} ({$daysBefore} hari).");
                }
            }
        }

        $this->info('Done.');

        return self::SUCCESS;
    }
}
