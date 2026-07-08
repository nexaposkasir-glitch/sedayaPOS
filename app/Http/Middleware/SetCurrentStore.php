<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetCurrentStore
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || $user->isGlobalAdmin()) {
            return $next($request);
        }

        // Already have a store selected
        if (session('current_store_id')) {
            return $next($request);
        }

        // User has stores — set first one, or redirect to picker
        $stores = $user->stores()->where('is_active', true)->get();

        if ($stores->isEmpty()) {
            // Legacy fallback: use user's store_id
            if ($user->store_id) {
                session(['current_store_id' => $user->store_id]);
                return $next($request);
            }
            // No store at all — allow access (will fail downstream)
            return $next($request);
        }

        if ($stores->count() === 1) {
            session(['current_store_id' => $stores->first()->id]);
            return $next($request);
        }

        // Multiple stores — redirect to picker (skip for store-picker route itself)
        if (! $request->routeIs('store-picker*')) {
            return redirect()->route('store-picker.index');
        }

        return $next($request);
    }
}
