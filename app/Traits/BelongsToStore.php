<?php

namespace App\Traits;

use App\Models\Store;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Automatically scope queries to the current user's store.
 *
 * Usage in model:
 *   use BelongsToStore;
 *
 * This trait:
 * - Adds a global scope that filters queries by store_id
 * - Automatically sets store_id when creating records
 * - Provides the store() relationship
 *
 * Global admin (store_id = null) bypasses all scopes automatically.
 */
trait BelongsToStore
{
    public static function bootBelongsToStore(): void
    {
        // Global scope: filter by current store (from session)
        static::addGlobalScope('store', function (Builder $query) {
            $user = auth()->user();

            // Global admin can see all data (no filtering)
            if ($user && $user->isGlobalAdmin()) {
                return;
            }

            $table = $query->getModel()->getTable();
            $storeId = session('current_store_id') ?? ($user ? $user->store_id : null);

            // Non-authenticated or no store_id: only show global records
            if (! $storeId) {
                $query->whereNull("{$table}.store_id");
                return;
            }

            $query->where("{$table}.store_id", $storeId);
        });

        // Auto-set store_id on create
        static::creating(function (Model $model) {
            if (! $model->store_id) {
                $user = auth()->user();

                if ($user && ! $user->isGlobalAdmin()) {
                    $model->store_id = session('current_store_id') ?? $user->store_id;
                }
            }
        });
    }

    /**
     * Get the store that owns this record.
     */
    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    /**
     * Scope: Only records belonging to a specific store.
     */
    public function scopeForStore(Builder $query, int $storeId): Builder
    {
        $table = $query->getModel()->getTable();
        return $query->withoutGlobalScope('store')->where("{$table}.store_id", $storeId);
    }

    /**
     * Scope: All records including those without a store (for global admin).
     */
    public function scopeWithGlobal(Builder $query): Builder
    {
        return $query->withoutGlobalScope('store');
    }
}
