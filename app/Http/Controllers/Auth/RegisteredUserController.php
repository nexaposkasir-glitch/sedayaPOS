<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Store;
use App\Models\User;
use App\Support\BotGuard;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        abort_unless(config('security.auth.public_registration'), 404);

        return Inertia::render('Auth/Register', [
            'botGuard' => BotGuard::payload(),
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        abort_unless(config('security.auth.public_registration'), 404);

        $request->validate([
            'name' => 'required|string|max:255',
            'store_name' => 'nullable|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $result = DB::transaction(function () use ($request) {
            // Create the store for this user
            $storeName = $request->store_name ?: 'Toko '.$request->name;
            $defaultPlan = Plan::default();
            $store = Store::create([
                'name' => $storeName,
                'plan_id' => $defaultPlan?->id,
                'is_active' => true,
                'subscription_status' => 'trial',
                'trial_ends_at' => now()->addDays(config('subscription.trial_days', 30)),
                'settings' => [
                    'store_name' => $storeName,
                    'tax_rate' => 0,
                    'currency' => 'IDR',
                ],
            ]);

            // Create user and link to store
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'store_id' => $store->id,
            ]);

            // Sync pivot: user belongs to this store as owner
            $store->users()->attach($user->id, ['role' => 'owner']);

            return ['user' => $user, 'store' => $store];
        });

        $user = $result['user'];
        $store = $result['store'];

        // Assign role: first user of store gets 'admin' role, others get 'cashier'
        $isFirstUser = $store->users()->count() === 1;
        if ($isFirstUser && Role::where('name', 'admin')->exists()) {
            $user->assignRole('admin');
        } elseif (Role::where('name', 'cashier')->exists()) {
            $user->assignRole('cashier');
        }

        event(new Registered($user));

        Auth::login($user);

        // Set session for the new store
        session(['current_store_id' => $store->id]);

        return redirect()->route('dashboard');
    }
}
