<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Store;
use App\Models\Supplier;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;

/**
 * Backfill store_id for all existing data when migrating to multi-tenant.
 * This seeder should run AFTER all seeders have created their data.
 * Only affects records that have NULL store_id.
 *
 * The default store (slug = 'sedaya-pos') owns all existing data.
 */
class StoreBackfillSeeder extends Seeder
{
    public function run(): void
    {
        $defaultStore = Store::where('slug', 'sedaya-pos')->first();

        if (! $defaultStore) {
            return;
        }

        $backfillTables = [
            'categories' => Category::class,
            'products' => Product::class,
            'warehouses' => Warehouse::class,
            'customers' => Customer::class,
            'suppliers' => Supplier::class,
        ];

        foreach ($backfillTables as $table => $model) {
            $model::withoutGlobalScopes()
                ->whereNull('store_id')
                ->update(['store_id' => $defaultStore->id]);
        }
    }
}
