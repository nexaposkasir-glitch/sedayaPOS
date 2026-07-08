<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class Store extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'slug', 'logo', 'address', 'phone', 'email',
        'website', 'city', 'settings', 'is_active', 'suspend_reason',
        'trial_ends_at', 'subscription_ends_at',
        'plan_id', 'parent_store_id', 'subscription_status', 'auto_renew',
        'cancelled_at', 'last_payment_at',
    ];

    protected $casts = [
        'settings' => 'array',
        'is_active' => 'boolean',
        'auto_renew' => 'boolean',
        'trial_ends_at' => 'datetime',
        'subscription_ends_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'last_payment_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (Store $store) {
            if (empty($store->slug)) {
                $slug = Str::slug($store->name);
                $original = $slug;
                $counter = 1;
                while (static::where('slug', $slug)->exists()) {
                    $slug = $original.'-'.$counter;
                    $counter++;
                }
                $store->slug = $slug;
            }
        });
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'store_user')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function products()
    {
        return $this->hasMany(\App\Models\Product::class);
    }

    /**
     * Parent store (the paying store, if this is a branch).
     */
    public function parentStore()
    {
        return $this->belongsTo(Store::class, 'parent_store_id');
    }

    /**
     * Branch stores under this parent.
     */
    public function branches()
    {
        return $this->hasMany(Store::class, 'parent_store_id');
    }

    /**
     * Is this store a branch of another store?
     */
    public function isBranch(): bool
    {
        return $this->parent_store_id !== null;
    }

    /**
     * Total stores under this parent (self + branches).
     */
    public function totalStores(): int
    {
        return 1 + $this->branches()->count();
    }

    /**
     * Get the effective store to use for subscription checks.
     * If this is a branch, return the parent (who pays the subscription).
     */
    public function effectiveStore(): self
    {
        if ($this->isBranch() && $this->parentStore) {
            return $this->parentStore;
        }
        return $this;
    }

    /**
     * Get the effective plan for this store.
     * Branches inherit the parent's plan.
     */
    public function effectivePlan(): ?Plan
    {
        return $this->effectiveStore()->plan;
    }

    public function subscriptionPayments()
    {
        return $this->hasMany(SubscriptionPayment::class);
    }

    public function owner()
    {
        return $this->users()->oldest()->first();
    }

    public function isOnTrial(): bool
    {
        $effective = $this->effectiveStore();
        if ($effective->id !== $this->id) {
            return $effective->isOnTrial();
        }
        if ($this->subscription_status === 'active' || $this->subscription_status === 'cancelled') {
            return false;
        }
        return $this->trial_ends_at && $this->trial_ends_at->isFuture();
    }

    public function isSubscribed(): bool
    {
        $effective = $this->effectiveStore();
        if ($effective->id !== $this->id) {
            return $effective->isSubscribed();
        }
        if ($this->subscription_status === 'past_due') {
            return $this->isInGracePeriod();
        }
        return $this->subscription_status === 'active'
            && $this->subscription_ends_at
            && $this->subscription_ends_at->isFuture();
    }

    public function isActive(): bool
    {
        if ($this->isBranch() && $this->parentStore) {
            if (! $this->parentStore->is_active) {
                return false;
            }
        }
        return $this->is_active && ($this->isOnTrial() || $this->isSubscribed());
    }

    /**
     * Check if the store has exceeded a plan limit.
     */
    public function hasReachedLimit(string $limitKey, int $currentCount): bool
    {
        $plan = $this->effectivePlan();
        if (! $plan) {
            return false;
        }

        $limit = $plan->getLimit($limitKey);
        if ($limit === null) {
            return false;
        }

        return $currentCount >= (int) $limit;
    }

    /**
     * Days remaining in trial/subscription. Negative means expired.
     */
    public function daysRemaining(): int
    {
        $effective = $this->effectiveStore();
        if ($effective->isSubscribed()) {
            return (int) now()->diffInDays($effective->subscription_ends_at, false);
        }
        if ($effective->trial_ends_at) {
            return (int) now()->diffInDays($effective->trial_ends_at, false);
        }
        return -1;
    }

    /**
     * Check if store is in grace period after subscription expired.
     */
    public function isInGracePeriod(): bool
    {
        $effective = $this->effectiveStore();
        if ($effective->id !== $this->id) {
            return $effective->isInGracePeriod();
        }
        if ($this->subscription_status !== 'past_due') {
            return false;
        }
        if (! $this->subscription_ends_at) {
            return false;
        }
        $graceDays = (int) config('subscription.grace_period_days', 7);
        return now()->lessThan($this->subscription_ends_at->copy()->addDays($graceDays));
    }

    /**
     * Suspend this store with a reason.
     */
    public function suspend(?string $reason = null, ?int $changedBy = null): void
    {
        DB::transaction(function () use ($reason, $changedBy) {
            $this->is_active = false;
            $this->suspend_reason = $reason;
            $this->save();

            SubscriptionHistory::create([
                'store_id' => $this->id,
                'plan_id' => $this->plan_id,
                'action' => SubscriptionHistory::ACTION_SUSPENDED,
                'changed_by' => $changedBy,
                'reason' => $reason,
            ]);
        });
    }

    /**
     * Resume a suspended store.
     */
    public function resume(?int $changedBy = null): void
    {
        DB::transaction(function () use ($changedBy) {
            $this->is_active = true;
            $this->suspend_reason = null;
            $this->save();

            SubscriptionHistory::create([
                'store_id' => $this->id,
                'plan_id' => $this->plan_id,
                'action' => SubscriptionHistory::ACTION_RESUMED,
                'changed_by' => $changedBy,
            ]);
        });
    }

    /**
     * Record a subscription history entry.
     */
    public function recordHistory(string $action, ?int $planId = null, ?int $changedBy = null, ?string $reason = null, ?array $metadata = null): void
    {
        SubscriptionHistory::create([
            'store_id' => $this->id,
            'plan_id' => $planId ?? $this->plan_id,
            'action' => $action,
            'changed_by' => $changedBy,
            'reason' => $reason,
            'metadata' => $metadata,
        ]);
    }

    /**
     * Activate a subscription for this store.
     */
    public function activateSubscription(Plan $plan, int $durationMonths = 1): void
    {
        DB::transaction(function () use ($plan, $durationMonths) {
            // Preserve remaining time if already subscribed
            $startFrom = now();
            if ($this->subscription_status === 'active' && $this->subscription_ends_at && $this->subscription_ends_at->isFuture()) {
                $startFrom = $this->subscription_ends_at->copy();
            }

            $this->plan_id = $plan->id;
            $this->subscription_status = 'active';
            $this->subscription_ends_at = $startFrom->addMonths($durationMonths);
            $this->last_payment_at = now();
            $this->auto_renew = true;
            $this->save();

            $this->recordHistory(
                SubscriptionHistory::ACTION_ACTIVATED,
                planId: $plan->id,
                reason: "Langganan diaktifkan: {$plan->name} ({$durationMonths} bulan)",
                metadata: ['duration_months' => $durationMonths]
            );
        });
    }

    public function getSetting(string $key, $default = null)
    {
        return data_get($this->settings, $key, $default);
    }
}
