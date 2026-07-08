<?php

namespace Database\Seeders;

use App\Models\Store;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $this->call([
            PlanSeeder::class,
            PermissionSeeder::class,
            RoleSeeder::class,
            UserSeeder::class,
            PaymentSettingSeeder::class,
            SampleDataSeeder::class,
            OperationalCoreSeeder::class,
            FeatureCoverageSeeder::class,
        ]);

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        // After all data is created, backfill store_id for existing records
        $this->call(StoreBackfillSeeder::class);

        // Seed default warehouse under the default store
        $this->seedDefaultWarehouse();
    }

    private function seedDefaultWarehouse(): void
    {
        // Get the default store
        $defaultStore = Store::where('slug', 'sedaya-pos')->first();

        if (Warehouse::withoutGlobalScopes()->where('code', 'PUSAT')->exists()) {
            return;
        }

        $pusat = Warehouse::withoutGlobalScopes()->create([
            'code' => 'PUSAT',
            'name' => 'Gudang Pusat',
            'type' => 'main',
            'is_active' => true,
            'sort_order' => 0,
            'store_id' => $defaultStore?->id,
        ]);

        // Migrate existing stock to pivot (under the default store)
        if ($defaultStore) {
            \Illuminate\Support\Facades\DB::statement("
                INSERT INTO product_warehouse (product_id, warehouse_id, store_id, stock, created_at, updated_at)
                SELECT id, {$pusat->id}, {$defaultStore->id}, stock, NOW(), NOW() FROM products
                WHERE store_id = {$defaultStore->id}
            ");
        }
    }
}
