<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Store;
use App\Models\SubscriptionHistory;
use App\Models\SubscriptionPayment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        if (! $user || ! $user->isGlobalAdmin()) {
            return redirect()->route('dashboard');
        }

        $totalStores = Store::count();
        $activeStores = Store::where('subscription_status', 'active')
            ->orWhere(function ($q) {
                $q->where('subscription_status', 'trial')
                    ->where('trial_ends_at', '>', now());
            })->count();
        $trialStores = Store::where('subscription_status', 'trial')
            ->where('trial_ends_at', '>', now())
            ->count();
        $expiredStores = Store::where(function ($q) {
            $q->where('subscription_status', 'expired')
                ->orWhere(function ($sq) {
                    $sq->where('subscription_status', 'trial')
                        ->where('trial_ends_at', '<=', now());
                });
        })->count();
        $totalUsers = User::whereNotNull('store_id')->count();

        $recentStores = Store::with('plan')
            ->withCount('users')
            ->latest()
            ->take(10)
            ->get()
            ->map(fn (Store $store) => [
                'id' => $store->id,
                'name' => $store->name,
                'plan_name' => $store->plan?->name ?? 'N/A',
                'subscription_status' => $store->subscription_status,
                'days_remaining' => $store->daysRemaining(),
                'users_count' => $store->users_count,
                'created_at' => $store->created_at->toISOString(),
            ]);

        $recentPayments = SubscriptionPayment::with(['store', 'plan'])
            ->where('status', SubscriptionPayment::STATUS_PAID)
            ->latest('paid_at')
            ->take(5)
            ->get()
            ->map(fn (SubscriptionPayment $p) => [
                'id' => $p->id,
                'store_name' => $p->store->name,
                'plan_name' => $p->plan->name,
                'amount' => (int) $p->amount,
                'gateway' => $p->gateway,
                'paid_at' => $p->paid_at?->toISOString(),
            ]);

        return Inertia::render('Dashboard/SuperAdmin/Dashboard', [
            'stats' => [
                'total_stores' => $totalStores,
                'active_stores' => $activeStores,
                'trial_stores' => $trialStores,
                'expired_stores' => $expiredStores,
                'total_users' => $totalUsers,
            ],
            'recentStores' => $recentStores,
            'recentPayments' => $recentPayments,
        ]);
    }

    public function stores(Request $request)
    {
        $user = auth()->user();

        if (! $user || ! $user->isGlobalAdmin()) {
            return redirect()->route('dashboard');
        }

        $status = $request->get('status', 'all');
        $search = $request->get('search', '');

        $storesQuery = Store::with('plan')
            ->withCount('users')
            ->when($status !== 'all', function ($q) use ($status) {
                match ($status) {
                    'active' => $q->where('subscription_status', 'active'),
                    'trial' => $q->where('subscription_status', 'trial')
                        ->where('trial_ends_at', '>', now()),
                    'expired' => $q->where(function ($sq) {
                        $sq->where('subscription_status', 'expired')
                            ->orWhere(function ($tq) {
                                $tq->where('subscription_status', 'trial')
                                    ->where('trial_ends_at', '<=', now());
                            });
                    }),
                    'cancelled' => $q->where('subscription_status', 'cancelled'),
                    'suspended' => $q->where('is_active', false)->whereNotNull('suspend_reason'),
                    default => null,
                };
            })
            ->when($search, fn ($q) => $q->where('name', 'like', "%{$search}%"))
            ->latest()
            ->paginate(20);

        $plans = Plan::where('is_active', true)->get();

        return Inertia::render('Dashboard/SuperAdmin/Stores', [
            'stores' => $storesQuery,
            'plans' => $plans,
            'filters' => [
                'status' => $status,
                'search' => $search,
            ],
        ]);
    }

    public function extendTrial(Request $request, Store $store)
    {
        $request->validate([
            'days' => 'required|integer|min:1|max:365',
        ]);

        $days = (int) $request->days;
        $oldEndsAt = $store->trial_ends_at;

        $store->trial_ends_at = max(now(), $store->trial_ends_at ?? now())->addDays($days);
        $store->subscription_status = 'trial';
        $store->save();

        $store->recordHistory(
            SubscriptionHistory::ACTION_EXTENDED,
            changedBy: auth()->id(),
            reason: "Trial diperpanjang {$days} hari",
            metadata: ['days' => $days, 'previous_ends_at' => $oldEndsAt?->toISOString()]
        );

        return back()->with('success', "Masa trial {$store->name} diperpanjang {$days} hari.");
    }

    public function changePlan(Request $request, Store $store)
    {
        $request->validate([
            'plan_id' => 'required|exists:plans,id',
        ]);

        $plan = Plan::findOrFail($request->plan_id);
        $oldPlanId = $store->plan_id;
        $oldPlanName = $store->plan?->name;

        $store->plan_id = $plan->id;
        $store->subscription_status = 'active';
        $store->subscription_ends_at = now()->addMonth();
        $store->save();

        $store->recordHistory(
            SubscriptionHistory::ACTION_CHANGED,
            planId: $plan->id,
            changedBy: auth()->id(),
            reason: "Paket diubah dari {$oldPlanName} ke {$plan->name}",
            metadata: ['previous_plan_id' => $oldPlanId]
        );

        return back()->with('success', "Paket {$store->name} diubah menjadi {$plan->name}.");
    }

    /**
     * Suspend a store with a reason.
     */
    public function suspend(Request $request, Store $store)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        if ($store->is_active === false && $store->suspend_reason) {
            return back()->with('error', 'Toko sudah dalam status suspend.');
        }

        $store->suspend($request->reason, auth()->id());

        return back()->with('success', "Toko {$store->name} telah disuspend.");
    }

    /**
     * Resume a suspended store.
     */
    public function resume(Store $store)
    {
        if ($store->is_active === true) {
            return back()->with('error', 'Toko tidak dalam status suspend.');
        }

        $store->resume(auth()->id());

        return back()->with('success', "Toko {$store->name} telah diaktifkan kembali.");
    }

    /**
     * Toggle store active/inactive status (legacy, for non-suspended toggling).
     */
    public function toggleStatus(Store $store)
    {
        // If store has suspend_reason, use resume instead
        if (! $store->is_active && $store->suspend_reason) {
            $store->resume(auth()->id());
            return back()->with('success', "Toko {$store->name} telah diaktifkan kembali.");
        }

        $store->is_active = ! $store->is_active;
        $store->save();

        $status = $store->is_active ? 'diaktifkan' : 'dinonaktifkan';
        return back()->with('success', "Toko {$store->name} telah {$status}.");
    }

    /**
     * Manually activate a subscription (offline payment, bank transfer).
     */
    public function activateManual(Request $request, Store $store)
    {
        $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'duration_months' => 'required|integer|in:1,3,6,12',
            'notes' => 'nullable|string|max:500',
        ]);

        $plan = Plan::findOrFail($request->plan_id);
        $duration = (int) $request->duration_months;

        // Create payment record
        SubscriptionPayment::create([
            'store_id' => $store->id,
            'plan_id' => $plan->id,
            'gateway' => 'manual',
            'notes' => $request->notes,
            'duration_months' => $duration,
            'external_id' => 'manual_' . Str::uuid(),
            'amount' => $plan->monthly_price * $duration,
            'status' => SubscriptionPayment::STATUS_PAID,
            'paid_at' => now(),
        ]);

        // Activate subscription
        $store->activateSubscription($plan, $duration);

        $store->recordHistory(
            SubscriptionHistory::ACTION_MANUAL_ACTIVATED,
            planId: $plan->id,
            changedBy: auth()->id(),
            reason: $request->notes ?? "Aktivasi manual {$duration} bulan",
            metadata: ['duration_months' => $duration, 'gateway' => 'manual']
        );

        return back()->with('success', "Langganan {$store->name} diaktifkan: {$plan->name} ({$duration} bulan).");
    }

    /**
     * Show detailed store subscription info.
     */
    public function storeDetail(Store $store)
    {
        $user = auth()->user();

        if (! $user || ! $user->isGlobalAdmin()) {
            return redirect()->route('dashboard');
        }

        $store->load('plan');
        $store->loadCount('users');

        $history = SubscriptionHistory::where('store_id', $store->id)
            ->with(['plan', 'changer'])
            ->latest()
            ->get()
            ->map(fn (SubscriptionHistory $h) => [
                'id' => $h->id,
                'action' => $h->action,
                'plan_name' => $h->plan?->name,
                'changed_by_name' => $h->changer?->name,
                'reason' => $h->reason,
                'metadata' => $h->metadata,
                'created_at' => $h->created_at->toISOString(),
            ]);

        $payments = SubscriptionPayment::where('store_id', $store->id)
            ->with('plan')
            ->latest()
            ->get()
            ->map(fn (SubscriptionPayment $p) => [
                'id' => $p->id,
                'plan_name' => $p->plan->name,
                'gateway' => $p->gateway,
                'notes' => $p->notes,
                'amount' => (int) $p->amount,
                'duration_months' => $p->duration_months,
                'status' => $p->status,
                'paid_at' => $p->paid_at?->toISOString(),
                'created_at' => $p->created_at->toISOString(),
            ]);

        $plans = Plan::where('is_active', true)->get();

        return Inertia::render('Dashboard/SuperAdmin/StoreDetail', [
            'store' => [
                'id' => $store->id,
                'name' => $store->name,
                'slug' => $store->slug,
                'email' => $store->email,
                'phone' => $store->phone,
                'address' => $store->address,
                'city' => $store->city,
                'is_active' => $store->is_active,
                'suspend_reason' => $store->suspend_reason,
                'subscription_status' => $store->subscription_status,
                'days_remaining' => $store->daysRemaining(),
                'trial_ends_at' => $store->trial_ends_at?->toISOString(),
                'subscription_ends_at' => $store->subscription_ends_at?->toISOString(),
                'is_trial' => $store->isOnTrial(),
                'is_in_grace_period' => $store->isInGracePeriod(),
                'plan_name' => $store->plan?->name,
                'plan_id' => $store->plan_id,
                'users_count' => $store->users_count,
                'created_at' => $store->created_at->toISOString(),
            ],
            'history' => $history,
            'payments' => $payments,
            'plans' => $plans,
            'durationOptions' => config('subscription.duration_options', [1 => '1 Bulan', 3 => '3 Bulan', 6 => '6 Bulan', 12 => '12 Bulan']),
        ]);
    }
}
