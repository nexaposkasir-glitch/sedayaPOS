<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\PaymentSetting;
use App\Models\Plan;
use App\Models\Store;
use App\Services\SubscriptionPaymentService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    /**
     * Resolve the current store from session, fallback to legacy.
     */
    private function resolveStore(): ?\App\Models\Store
    {
        $user = auth()->user();
        if (! $user) {
            return null;
        }
        $storeId = session('current_store_id') ?? $user->store_id;
        if (! $storeId) {
            return null;
        }
        return \App\Models\Store::with('plan')->find($storeId);
    }

    /**
     * Show subscription status & available plans.
     */
    public function index()
    {
        $user = auth()->user();
        $store = $this->resolveStore();

        // Global admin sees all plan info + store management panel
        if ($user->isGlobalAdmin() && ! $store) {
            $allStores = Store::with('plan')
                ->withCount('users')
                ->latest()
                ->get()
                ->map(fn (Store $s) => [
                    'id' => $s->id,
                    'name' => $s->name,
                    'is_active' => $s->is_active,
                    'suspend_reason' => $s->suspend_reason,
                    'plan_name' => $s->plan?->name ?? 'N/A',
                    'plan_id' => $s->plan_id,
                    'subscription_status' => $s->subscription_status,
                    'trial_ends_at' => $s->trial_ends_at?->toISOString(),
                    'subscription_ends_at' => $s->subscription_ends_at?->toISOString(),
                    'days_remaining' => $s->daysRemaining(),
                    'users_count' => $s->users_count,
                    'is_in_grace_period' => $s->isInGracePeriod(),
                ]);

            return Inertia::render('Dashboard/Subscription/Index', [
                'store' => null,
                'currentPlan' => null,
                'plans' => Plan::where('is_active', true)->orderBy('sort_order')->get(),
                'isGlobalAdmin' => true,
                'allStores' => $allStores,
                'adminContact' => $this->getAdminContact(),
                'subscriptionStats' => [
                    'total' => $allStores->count(),
                    'active' => $allStores->where('subscription_status', 'active')->count(),
                    'trial' => $allStores->where('subscription_status', 'trial')->count(),
                    'expired' => $allStores->whereIn('subscription_status', ['expired', 'past_due'])->count(),
                ],
            ]);
        }

        if (! $store) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Dashboard/Subscription/Index', [
            'store' => [
                'id' => $store->id,
                'name' => $store->name,
                'subscription_status' => $store->subscription_status,
                'trial_ends_at' => $store->trial_ends_at?->toISOString(),
                'subscription_ends_at' => $store->subscription_ends_at?->toISOString(),
                'days_remaining' => $store->daysRemaining(),
                'is_trial' => $store->isOnTrial(),
                'is_subscribed' => $store->isSubscribed(),
            ],
            'currentPlan' => $store->plan,
            'plans' => Plan::where('is_active', true)->orderBy('sort_order')->get(),
            'isGlobalAdmin' => false,
            'adminContact' => $this->getAdminContact(),
        ]);
    }

    /**
     * Redirect to checkout page for paid plan.
     */
    public function checkout(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|exists:plans,id',
        ]);

        $user = auth()->user();
        $store = $this->resolveStore();

        if (! $store) {
            return redirect()->route('subscription.index')->with('error', 'Toko tidak ditemukan.');
        }

        $plan = Plan::findOrFail($request->plan_id);

        // Free plan — activate directly without checkout
        if ($plan->isFree()) {
            $store->activateSubscription($plan, 1);
            return redirect()->route('subscription.index')->with('success', "Paket {$plan->name} berhasil diaktifkan.");
        }

        $paymentSetting = PaymentSetting::first();
        $gateways = $paymentSetting ? $paymentSetting->enabledGateways() : [];

        return Inertia::render('Dashboard/Subscription/Checkout', [
            'store' => [
                'id' => $store->id,
                'name' => $store->name,
            ],
            'plan' => $plan,
            'gateways' => $gateways,
            'currentPlan' => $store->plan,
        ]);
    }

    /**
     * Create payment and redirect to gateway.
     */
    public function pay(Request $request, SubscriptionPaymentService $paymentService)
    {
        $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'gateway' => 'required|string|in:midtrans,xendit',
            'duration' => 'nullable|integer|min:1|max:12',
        ]);

        $user = auth()->user();
        $store = $this->resolveStore();

        if (! $store) {
            return back()->with('error', 'Toko tidak ditemukan.');
        }

        $plan = Plan::findOrFail($request->plan_id);

        if ($plan->isFree()) {
            return back()->with('error', 'Paket gratis tidak memerlukan pembayaran.');
        }

        $duration = (int) ($request->duration ?? 1);

        try {
            $payment = $paymentService->createPayment($store, $plan, $request->gateway, $duration);

            // Redirect to payment gateway URL
            if ($payment->payment_url) {
                return Inertia::location($payment->payment_url);
            }

            return back()->with('error', 'Gagal mendapatkan URL pembayaran.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Select/upgrade to a plan.
     */
    public function upgrade(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|exists:plans,id',
        ]);

        $user = auth()->user();
        $store = $this->resolveStore();

        if (! $store) {
            return back()->with('error', 'Toko tidak ditemukan.');
        }

        $plan = Plan::findOrFail($request->plan_id);

        // Free plan — activate immediately
        if ($plan->isFree()) {
            $store->plan_id = $plan->id;
            $store->subscription_status = 'active';
            $store->subscription_ends_at = now()->addYear(); // Free = 1 year
            $store->auto_renew = true;
            $store->save();

            return back()->with('success', 'Paket Gratis berhasil diaktifkan!');
        }

        // Paid plan — redirect to checkout instead of auto-activating
        return redirect()->route('subscription.checkout', ['plan_id' => $plan->id]);
    }

    /**
     * Show invoice/success page after payment.
     */
    public function invoice(Request $request)
    {
        $user = auth()->user();
        $store = $this->resolveStore();

        if (! $store) {
            return redirect()->route('subscription.index');
        }

        return Inertia::render('Dashboard/Subscription/Invoice', [
            'store' => [
                'id' => $store->id,
                'name' => $store->name,
                'subscription_status' => $store->subscription_status,
                'subscription_ends_at' => $store->subscription_ends_at?->toISOString(),
                'days_remaining' => $store->daysRemaining(),
            ],
            'currentPlan' => $store->plan,
        ]);
    }

    /**
     * Show billing/payment history.
     */
    public function billing()
    {
        $user = auth()->user();
        $store = $this->resolveStore();

        // Global admin can see all payments
        if ($user->isGlobalAdmin() && ! $store) {
            $payments = \App\Models\SubscriptionPayment::with(['store', 'plan'])
                ->latest()
                ->paginate(20);

            return Inertia::render('Dashboard/Subscription/Billing', [
                'store' => null,
                'payments' => $payments,
                'isGlobalAdmin' => true,
            ]);
        }

        if (! $store) {
            return redirect()->route('subscription.index');
        }

        $payments = \App\Models\SubscriptionPayment::where('store_id', $store->id)
            ->with('plan')
            ->latest()
            ->paginate(20);

        return Inertia::render('Dashboard/Subscription/Billing', [
            'store' => [
                'id' => $store->id,
                'name' => $store->name,
                'subscription_status' => $store->subscription_status,
            ],
            'payments' => $payments,
        ]);
    }

    /**
     * Get superadmin contact info for display on subscription page.
     */
    private function getAdminContact(): array
    {
        $admin = \App\Models\User::whereNull('store_id')
            ->whereHas('roles', fn ($q) => $q->where('name', 'super-admin'))
            ->first();

        return [
            'name' => $admin?->name ?? 'Admin SedayaPOS',
            'email' => \App\Models\Setting::get('admin_contact_email', $admin?->email ?? 'admin@sedayapos.com'),
            'whatsapp' => \App\Models\Setting::get('admin_whatsapp', '087751287965'),
        ];
    }

    /**
     * Save admin contact info (superadmin only).
     */
    public function saveAdminContact(Request $request)
    {
        $user = auth()->user();
        if (! $user || ! $user->isGlobalAdmin()) {
            return back()->with('error', 'Akses ditolak.');
        }

        $request->validate([
            'email' => 'nullable|email|max:255',
            'whatsapp' => 'nullable|string|max:50',
        ]);

        \App\Models\Setting::set('admin_contact_email', $request->email);
        \App\Models\Setting::set('admin_whatsapp', $request->whatsapp);

        return back()->with('success', 'Kontak admin berhasil disimpan.');
    }
}
