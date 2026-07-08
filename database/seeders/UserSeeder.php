<?php

namespace Database\Seeders;

use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        // Default store for non-global users (test users, cashiers)
        $defaultStore = Store::updateOrCreate(
            ['slug' => 'sedaya-pos'],
            [
                'name' => 'SedayaPOS',
                'address' => 'Jl. Contoh No. 123',
                'phone' => '081234567890',
                'is_active' => true,
                'plan_id' => \App\Models\Plan::where('slug', 'enterprise')->value('id'),
                'subscription_status' => 'active',
                'subscription_ends_at' => now()->addYears(10),
                'trial_ends_at' => now()->addYears(10),
                'settings' => [
                    'store_name' => 'SedayaPOS',
                    'store_address' => 'Jl. Contoh No. 123',
                    'store_phone' => '081234567890',
                    'tax_rate' => 0,
                    'currency' => 'IDR',
                ],
            ]
        );

        // Global admin (platform super-admin, no store_id)
        $admin = User::updateOrCreate(
            ['email' => 'kseduh5@gmail.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'store_id' => null, // Global admin — no store
            ]
        );

        // Test admin (belongs to default store)
        $adminTest = User::updateOrCreate(
            ['email' => 'arya@gmail.com'],
            [
                'name' => 'Arya Dwi Putra',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'store_id' => $defaultStore->id,
            ]
        );

        $superAdminRole = Role::where('name', 'super-admin')->first();
        $permissions = Permission::all();

        if ($superAdminRole) {
            $admin->syncRoles([$superAdminRole->name]);
            $adminTest->syncRoles([$superAdminRole->name]);
        }

        $admin->syncPermissions($permissions);
        $adminTest->syncPermissions($permissions);

        $cashier = User::updateOrCreate(
            ['email' => 'cashier@gmail.com'],
            [
                'name' => 'Cashier',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'store_id' => $defaultStore->id,
            ]
        );

        $cashierRole = Role::where('name', 'cashier')->first();

        if ($cashierRole) {
            $cashier->syncRoles([$cashierRole->name]);
            $cashier->syncPermissions([]);
            app(PermissionRegistrar::class)->forgetCachedPermissions();

            return;
        }

        $transactionsPermission = Permission::where('name', 'transactions-access')->first();
        $cashier->syncPermissions($transactionsPermission ? [$transactionsPermission] : []);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
