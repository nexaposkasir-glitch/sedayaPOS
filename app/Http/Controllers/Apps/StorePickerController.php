<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StorePickerController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        if (! $user || $user->isGlobalAdmin()) {
            return redirect()->route('dashboard');
        }

        $stores = $user->stores()
            ->where('is_active', true)
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'address' => $s->address,
                'city' => $s->city,
                'is_branch' => $s->isBranch(),
                'parent_name' => $s->parentStore?->name,
                'subscription_status' => $s->subscription_status,
                'plan_name' => $s->plan?->name ?? $s->parentStore?->plan?->name,
            ]);

        if ($stores->isEmpty()) {
            // Fallback: set the user's legacy store
            session(['current_store_id' => $user->store_id]);
            return redirect()->route('dashboard');
        }

        if ($stores->count() === 1) {
            session(['current_store_id' => $stores->first()['id']]);
            return redirect()->route('dashboard');
        }

        return Inertia::render('Auth/StorePicker', [
            'stores' => $stores,
        ]);
    }

    public function select(Request $request)
    {
        $user = auth()->user();

        if (! $user || $user->isGlobalAdmin()) {
            return redirect()->route('dashboard');
        }

        $request->validate([
            'store_id' => 'required|integer|exists:stores,id',
        ]);

        // Verify user belongs to this store
        $belongs = $user->stores()->where('store_id', $request->store_id)->exists();

        if (! $belongs) {
            return back()->with('error', 'Anda tidak memiliki akses ke toko ini.');
        }

        session(['current_store_id' => $request->store_id]);

        return redirect()->route('dashboard');
    }

    /**
     * Switch store from sidebar dropdown.
     */
    public function switch(Request $request)
    {
        $user = auth()->user();

        if (! $user || $user->isGlobalAdmin()) {
            return redirect()->route('dashboard');
        }

        $request->validate([
            'store_id' => 'required|integer',
        ]);

        $belongs = $user->stores()->where('store_id', $request->store_id)->exists();

        if (! $belongs) {
            return back()->with('error', 'Akses ditolak.');
        }

        session(['current_store_id' => $request->store_id]);

        return redirect()->route('dashboard');
    }
}
