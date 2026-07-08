<?php

namespace App\Http\Middleware;

use App\Models\Store;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureStoreIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        // Global admin can always access
        if ($user->isGlobalAdmin()) {
            return $next($request);
        }

        $storeId = session('current_store_id') ?? $user->store_id;
        if (! $storeId) {
            return $next($request);
        }

        $store = Store::find($storeId);
        if (! $store) {
            return $next($request);
        }

        // Store is suspended
        if ($store->is_active === false && $store->suspend_reason) {
            $request->session()->flash('error',
                'Toko Anda telah dinonaktifkan. Alasan: ' . $store->suspend_reason
            );
            auth()->logout();
            return redirect()->route('login');
        }

        // Store is active (trial or subscribed)
        if ($store->isActive()) {
            return $next($request);
        }

        // Store is in grace period — allow access with warning
        if ($store->isInGracePeriod()) {
            $request->session()->flash('warning',
                'Langganan Anda telah berakhir. Anda masih dapat mengakses sistem selama masa tenggang. Segera perpanjang langganan Anda.'
            );
            return $next($request);
        }

        // Store is fully inactive
        $request->session()->flash('warning', $store->isOnTrial()
            ? 'Masa trial Anda telah berakhir. Silakan pilih paket langganan untuk melanjutkan.'
            : 'Langganan Anda telah berakhir. Silakan perpanjang untuk melanjutkan.'
        );

        return redirect()->route('subscription.index');
    }
}
