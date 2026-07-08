<?php

use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // Migrate existing users.store_id to store_user pivot
        $users = User::whereNotNull('store_id')->get();

        foreach ($users as $user) {
            $store = Store::find($user->store_id);
            if ($store) {
                // Check if already exists
                $exists = \DB::table('store_user')
                    ->where('user_id', $user->id)
                    ->where('store_id', $store->id)
                    ->exists();

                if (! $exists) {
                    \DB::table('store_user')->insert([
                        'user_id' => $user->id,
                        'store_id' => $store->id,
                        'role' => $user->hasRole('super-admin') ? 'owner' : 'cashier',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }

    public function down(): void
    {
        // No reversal needed
    }
};
