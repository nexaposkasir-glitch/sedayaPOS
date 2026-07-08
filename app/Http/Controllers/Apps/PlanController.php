<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlanController extends Controller
{
    /**
     * Show all plans for editing (superadmin only).
     */
    public function index()
    {
        $user = auth()->user();
        if (! $user || ! $user->isGlobalAdmin()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Dashboard/SuperAdmin/Plans', [
            'plans' => Plan::orderBy('sort_order')->get(),
        ]);
    }

    /**
     * Update plan details.
     */
    public function update(Request $request, Plan $plan)
    {
        $user = auth()->user();
        if (! $user || ! $user->isGlobalAdmin()) {
            return back()->with('error', 'Akses ditolak.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'monthly_price' => 'required|numeric|min:0',
            'yearly_price' => 'nullable|numeric|min:0',
            'features' => 'nullable|array',
            'features.*' => 'string|max:50',
            'limits' => 'nullable|array',
            'limits.max_products' => 'nullable|integer|min:1',
            'limits.max_users' => 'nullable|integer|min:1',
            'limits.max_transactions_per_month' => 'nullable|integer|min:1',
            'limits.max_stores' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        // Only one plan can be default
        if ($validated['is_default'] ?? false) {
            Plan::where('id', '!=', $plan->id)->update(['is_default' => false]);
        }

        $plan->update($validated);

        return back()->with('success', "Paket {$plan->name} berhasil diperbarui.");
    }
}
