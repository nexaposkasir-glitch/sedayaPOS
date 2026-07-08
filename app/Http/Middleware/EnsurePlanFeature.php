<?php

namespace App\Http\Middleware;

use App\Models\Store;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePlanFeature
{
    /**
     * Check if the store's plan has the required feature.
     *
     * Usage in routes: ->middleware('plan_feature:crm_automation')
     */
    public function handle(Request $request, Closure $next, string $feature): Response
    {
        $user = $request->user();

        // Global admin bypasses all feature gates
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

        if (! $plan->hasFeature($feature)) {
            $featureLabels = [
                'crm_automation' => 'CRM Automation',
                'purchase_orders' => 'Purchase Orders',
                'stock_opname' => 'Stock Opname',
                'sales_returns' => 'Sales Returns',
                'loyalty_program' => 'Program Loyalitas',
                'whatsapp_notifications' => 'Notifikasi WhatsApp',
                'advanced_reports' => 'Laporan Lanjutan',
                'price_lists' => 'Daftar Harga',
                'multi_warehouse' => 'Multi Gudang',
                'stock_transfers' => 'Transfer Stok',
            ];

            $label = $featureLabels[$feature] ?? $feature;

            return back()->with('error', "Fitur {$label} tidak tersedia di paket {$plan->name}. Silakan upgrade paket Anda.");
        }

        return $next($request);
    }
}
