<?php

namespace App\Http\Middleware;

use App\Models\Store;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePlanLimit
{
    /**
     * Check plan limits for the given resource type.
     *
     * Usage in routes: ->middleware('plan_limit:max_products')
     */
    public function handle(Request $request, Closure $next, string $limitKey): Response
    {
        $user = $request->user();

        // Global admin bypasses all limits
        if ($user && $user->isGlobalAdmin()) {
            return $next($request);
        }

        $storeId = session('current_store_id') ?? $user?->store_id;
        if (! $storeId) {
            return $next($request);
        }

        $store = Store::find($storeId);
        if (! $store) {
            return $next($request);
        }

        $plan = $store->effectivePlan();
        if (! $plan) {
            return $next($request);
        }

        $effectiveStore = $store->effectiveStore();

        $currentCount = match ($limitKey) {
            'max_products' => $effectiveStore->products()->withoutGlobalScopes()->count(),
            'max_users' => $effectiveStore->users()->withoutGlobalScopes()->count(),
            'max_stores' => $effectiveStore->totalStores(),
            default => 0,
        };

        if ($store->hasReachedLimit($limitKey, $currentCount)) {
            $planName = $plan->name;
            $limit = $plan->getLimit($limitKey);

            return back()->with('error', "Paket {$planName} Anda dibatasi {$limit} untuk fitur ini. Silakan upgrade paket Anda.");
        }

        return $next($request);
    }
}
