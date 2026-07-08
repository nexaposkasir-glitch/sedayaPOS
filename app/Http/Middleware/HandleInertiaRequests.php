<?php

namespace App\Http\Middleware;

use App\Models\CashierShift;
use App\Models\Payable;
use App\Models\Product;
use App\Models\Receivable;
use App\Models\Transaction;
use App\Services\CashierShiftService;
use App\Services\PayableAgingService;
use App\Services\ReceivableService;
use App\Support\ProductionSecurityBaseline;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $lowStockNotifications = [];
        $receivableNotifications = [];
        $payableNotifications = [];
        $activeCashierShift = null;
        $securityWarnings = [];
        $stepUpFreshUntil = null;
        $payableAgingSummary = null;
        $receivableAgingSummary = null;
        $pendingApprovalCount = 0;

        if ($request->user()) {
            $userId = $request->user()->id;

            if ($request->user()->can('discounts-approve')) {
                $pendingApprovalCount = Transaction::where('discount_approval_status', 'pending')->count();
            }

            $lowStockNotifications = Product::where('min_stock', '>', 0)
                ->whereColumn('stock', '<=', 'min_stock')
                ->whereNotExists(function ($query) use ($userId) {
                    $query->selectRaw('1')
                        ->from('product_notification_reads as pr')
                        ->whereColumn('pr.product_id', 'products.id')
                        ->where('pr.user_id', $userId)
                        ->whereColumn('pr.updated_at', '>=', 'products.updated_at');
                })
                ->orderByDesc('updated_at')
                ->limit(10)
                ->get(['id', 'title', 'stock', 'updated_at'])
                ->map(function ($product) {
                    return [
                        'id' => $product->id,
                        'title' => $product->title,
                        'stock' => (int) $product->stock,
                        'time' => optional($product->updated_at)->diffForHumans(),
                    ];
                });

            $payableAgingService = new PayableAgingService;
            $receivableService = new ReceivableService;

            $payableAgingSummary = $payableAgingService->getAgingSummary();
            $receivableAgingSummary = $receivableService->getAgingSummary();

            $receivableNotifications = Receivable::whereNot('status', 'paid')
                ->whereNotNull('due_date')
                ->whereDate('due_date', '<=', now()->addDays(3))
                ->orderBy('due_date')
                ->limit(5)
                ->get(['id', 'invoice', 'customer_id', 'due_date', 'total', 'paid', 'status'])
                ->map(function ($item) {
                    $remaining = max(0, ($item->total ?? 0) - ($item->paid ?? 0));

                    return [
                        'id' => $item->id,
                        'title' => "Piutang: {$item->invoice}",
                        'subtitle' => 'Sisa '.number_format($remaining, 0, ',', '.'),
                        'time' => optional($item->due_date)->diffForHumans(),
                        'status' => $item->status,
                        'aging_bucket' => $item->aging_bucket,
                    ];
                });

            $payableNotifications = Payable::whereNot('status', 'paid')
                ->whereNotNull('due_date')
                ->whereDate('due_date', '<=', now()->addDays(3))
                ->orderBy('due_date')
                ->limit(5)
                ->get(['id', 'document_number', 'due_date', 'total', 'paid', 'status'])
                ->map(function ($item) {
                    $remaining = max(0, ($item->total ?? 0) - ($item->paid ?? 0));

                    return [
                        'id' => $item->id,
                        'title' => "Hutang: {$item->document_number}",
                        'subtitle' => 'Sisa '.number_format($remaining, 0, ',', '.'),
                        'time' => optional($item->due_date)->diffForHumans(),
                        'status' => $item->status,
                        'aging_bucket' => $item->aging_bucket,
                    ];
                });

            $activeShift = CashierShift::query()
                ->with('user:id,name', 'warehouse:id,code,name')
                ->open()
                ->where('user_id', $userId)
                ->latest('opened_at')
                ->first();

            if ($activeShift) {
                $activeCashierShift = app(CashierShiftService::class)->summarizeForDisplay($activeShift);
            }

            $securityWarnings = ProductionSecurityBaseline::issues();

            $confirmedAt = (int) $request->session()->get('auth.password_confirmed_at', 0);
            if ($confirmedAt > 0) {
                $stepUpFreshUntil = now()
                    ->setTimestamp($confirmedAt + (int) config('auth.password_timeout', 900))
                    ->toISOString();
            }
        }

        $storeProfile = null;
        $userStore = null;
        $availableStores = [];

        // Multi-tenant: read store from session, fallback to user's store_id
        $storeId = session('current_store_id') ?? ($request->user() ? $request->user()->store_id : null);

        if ($storeId) {
            $store = \App\Models\Store::with('plan')->find($storeId);
            if ($store && $store->is_active) {
                $userStore = [
                    'id' => $store->id,
                    'slug' => $store->slug,
                    'is_active' => $store->is_active,
                    'is_branch' => $store->isBranch(),
                    'parent_store_id' => $store->parent_store_id,
                    'trial_ends_at' => $store->trial_ends_at?->toISOString(),
                    'subscription_ends_at' => $store->subscription_ends_at?->toISOString(),
                    'planUsage' => $this->buildPlanUsage($store),
                ];

                $logo = $store->logo;
                if ($logo && ! str_starts_with($logo, 'http') && ! str_starts_with($logo, '/storage')) {
                    $logo = asset('storage/'.ltrim($logo, '/'));
                }

                $storeProfile = [
                    'name' => $store->name,
                    'logo' => $logo,
                    'address' => $store->address ?? '',
                    'phone' => $store->phone ?? '',
                    'email' => $store->email ?? '',
                    'website' => $store->website ?? '',
                    'city' => $store->city ?? '',
                    'printer_auto_print' => \App\Models\Setting::getBool('printer_auto_print', false),
                    'printer_paper_size' => \App\Models\Setting::get('printer_paper_size', '80mm'),
                    'printer_cash_drawer' => \App\Models\Setting::getBool('printer_cash_drawer', false),
                    'printer_device_id' => \App\Models\Setting::get('printer_device_id', ''),
                    'printer_device_name' => \App\Models\Setting::get('printer_device_name', ''),
                ];
            }
        }

        // Fallback: read from settings table (backward compat for global admin without store)
        if (! $storeProfile && Schema::hasTable('settings')) {
            $logo = \App\Models\Setting::get('store_logo');
            if ($logo && ! str_starts_with($logo, 'http') && ! str_starts_with($logo, '/storage')) {
                $logo = asset('storage/'.ltrim($logo, '/'));
            }

            $storeProfile = [
                'name' => \App\Models\Setting::get('store_name', 'Toko Anda'),
                'logo' => $logo,
                'address' => \App\Models\Setting::get('store_address', ''),
                'phone' => \App\Models\Setting::get('store_phone', ''),
                'email' => \App\Models\Setting::get('store_email', ''),
                'website' => \App\Models\Setting::get('store_website', ''),
                'city' => \App\Models\Setting::get('store_city', ''),
                'printer_auto_print' => \App\Models\Setting::getBool('printer_auto_print', false),
                'printer_paper_size' => \App\Models\Setting::get('printer_paper_size', '80mm'),
                'printer_cash_drawer' => \App\Models\Setting::getBool('printer_cash_drawer', false),
                'printer_device_id' => \App\Models\Setting::get('printer_device_id', ''),
                'printer_device_name' => \App\Models\Setting::get('printer_device_name', ''),
            ];
        }

        // Available stores for store switcher (non-global-admin with multiple stores)
        if ($request->user() && ! $request->user()->isGlobalAdmin()) {
            $stores = $request->user()->stores()->where('is_active', true)->get();
            if ($stores->count() > 1) {
                $availableStores = $stores->map(fn ($s) => [
                    'id' => $s->id,
                    'name' => $s->name,
                    'is_branch' => $s->isBranch(),
                    'is_current' => $s->id === ($storeId ?? null),
                ])->values()->toArray();
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'permissions' => $request->user() ? $request->user()->getPermissions() : [],
                'super' => $request->user() ? $request->user()->isSuperAdmin() : false,
                'globalAdmin' => $request->user() ? $request->user()->isGlobalAdmin() : false,
            ],
            'lowStockNotifications' => $lowStockNotifications,
            'receivableNotifications' => $receivableNotifications,
            'payableNotifications' => $payableNotifications,
            'payableAgingSummary' => $payableAgingSummary,
            'receivableAgingSummary' => $receivableAgingSummary,
            'activeCashierShift' => $activeCashierShift,
            'storeProfile' => $storeProfile,
            'store' => $userStore,
            'availableStores' => $availableStores,
            'isImpersonating' => session()->has('impersonate_admin_id'),
            'pendingApprovalCount' => $pendingApprovalCount,
            'appVersion' => config('app.version'),
            'security' => [
                'warnings' => $securityWarnings,
                'publicRegistrationEnabled' => config('security.auth.public_registration'),
                'stepUpFreshUntil' => $stepUpFreshUntil,
            ],
        ];
    }

    /**
     * Build plan usage data for the frontend.
     */
    private function buildPlanUsage($store): ?array
    {
        if (! $store) {
            return null;
        }

        $plan = $store->effectivePlan();
        if (! $plan) {
            return null;
        }

        $limits = $plan->limits ?? [];
        $effectiveStore = $store->effectiveStore();

        $productCount = $effectiveStore->products()->count();
        $userCount = $effectiveStore->users()->count();
        $transactionCount = \App\Models\Transaction::query()
            ->withoutGlobalScopes()
            ->where('store_id', $effectiveStore->id)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        // Only include limits that are defined
        $items = [];
        foreach (['max_products' => $productCount, 'max_users' => $userCount, 'max_transactions_per_month' => $transactionCount] as $key => $current) {
            $limit = data_get($limits, $key);
            if ($limit !== null) {
                $items[] = [
                    'key' => $key,
                    'label' => match ($key) {
                        'max_products' => 'Produk',
                        'max_users' => 'Pengguna',
                        'max_transactions_per_month' => 'Transaksi',
                        default => $key,
                    },
                    'current' => $current,
                    'limit' => (int) $limit,
                    'percentage' => $limit > 0 ? min(100, round(($current / $limit) * 100)) : 0,
                    'isNearLimit' => $limit > 0 && ($current / $limit) >= 0.8,
                    'isReachedLimit' => $limit > 0 && $current >= $limit,
                ];
            }
        }

        return $items;
    }
}
