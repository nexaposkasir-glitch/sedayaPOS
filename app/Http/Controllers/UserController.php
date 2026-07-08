<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserRequest;
use App\Models\Plan;
use App\Models\Store;
use App\Models\User;
use App\Services\AuditLogService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function __construct(
        private readonly AuditLogService $auditLogService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // get all users data
        $users = User::query()
            ->with('roles')
            ->when(request()->search, fn ($query) => $query->where('name', 'like', '%'.request()->search.'%'))
            ->select('id', 'name', 'avatar', 'email')
            ->latest()
            ->paginate(7)
            ->withQueryString();

        // render view
        return Inertia::render('Dashboard/Users/Index', [
            'users' => $users,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $roles = Role::query()
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        $stores = Store::select('id', 'name')->orderBy('name')->get();

        $plans = Plan::select('id', 'name', 'monthly_price', 'description', 'limits', 'features')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $isGlobalAdmin = auth()->user()?->isGlobalAdmin() ?? false;

        return Inertia::render('Dashboard/Users/Create', [
            'roles' => $roles,
            'stores' => $stores,
            'plans' => $plans,
            'isGlobalAdmin' => $isGlobalAdmin,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(UserRequest $request)
    {
        return DB::transaction(function () use ($request) {
            // Resolve store: either existing or new
            if ($request->store_id === 'new') {
                $store = Store::create([
                    'name' => $request->new_store_name,
                    'is_active' => true,
                    'subscription_status' => 'trial',
                    'trial_ends_at' => Carbon::now()->addDays((int) config('subscription.trial_days', 30)),
                ]);
            } else {
                $store = Store::findOrFail($request->store_id);
            }

            // Assign plan to store
            if ($request->plan_id) {
                $plan = Plan::findOrFail($request->plan_id);

                if ($plan->isFree()) {
                    $store->update([
                        'plan_id' => $plan->id,
                        'subscription_status' => 'active',
                        'trial_ends_at' => null,
                        'subscription_ends_at' => Carbon::now()->addYears(100),
                    ]);
                } else {
                    $store->update([
                        'plan_id' => $plan->id,
                        'subscription_status' => 'trial',
                        'trial_ends_at' => Carbon::now()->addDays((int) config('subscription.trial_days', 30)),
                        'subscription_ends_at' => null,
                    ]);
                }
            }

            $avatarPath = null;
            if ($request->file('avatar')) {
                $avatarPath = $request->file('avatar')->store('avatars', 'public');
            }

            // create new user data — email auto-verified (created by superadmin)
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => bcrypt($request->password),
                'avatar' => $avatarPath,
                'store_id' => $store->id,
                'email_verified_at' => now(),
            ]);

            // assign role to user
            $user->assignRole($request->selectedRoles);

            // sync to store_user pivot
            $store->users()->syncWithoutDetaching([
                $user->id => ['role' => $request->store_role ?? 'admin'],
            ]);

            $this->auditLogService->log(
                event: 'user.created',
                module: 'users',
                auditable: $user,
                description: 'Pengguna baru dibuat oleh superadmin.',
                after: $this->userPayload(
                    $user,
                    $this->auditLogService->roleNames($request->selectedRoles),
                    $avatarPath !== null
                ),
            );

            // render view
            return to_route('users.index')->with('success', "Pengguna {$user->name} berhasil didaftarkan ke toko {$store->name}.");
        });
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        $roles = Role::query()
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        $stores = Store::select('id', 'name')->orderBy('name')->get();

        $user->load(['roles' => fn ($query) => $query->select('id', 'name'), 'roles.permissions' => fn ($query) => $query->select('id', 'name')]);

        return Inertia::render('Dashboard/Users/Edit', [
            'roles' => $roles,
            'stores' => $stores,
            'user' => $user,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UserRequest $request, User $user)
    {
        $beforeRoles = $user->roles()->pluck('name')->all();
        $before = $this->userPayload($user, $beforeRoles, false);
        $avatarPath = $user->getRawOriginal('avatar');
        $avatarChanged = false;

        if ($request->file('avatar')) {
            if ($avatarPath) {
                Storage::disk('public')->delete($avatarPath);
            }

            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $avatarChanged = true;
        }

        // check if user send request password
        if ($request->password) {
            // update user data password
            $user->update([
                'password' => bcrypt($request->password),
            ]);
        }

        // update user data name
        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'avatar' => $avatarPath,
        ]);

        // assign role to user
        $user->syncRoles($request->selectedRoles);

        // sync store_id
        if ($request->store_id) {
            $user->update(['store_id' => $request->store_id]);
            $store = Store::find($request->store_id);
            if ($store) {
                $store->users()->syncWithoutDetaching([$user->id => ['role' => $request->store_role ?? 'cashier']]);
            }
        }

        $afterRoles = $this->auditLogService->roleNames($request->selectedRoles);
        $after = $this->userPayload($user->fresh(), $afterRoles, $avatarChanged);

        $this->auditLogService->log(
            event: 'user.updated',
            module: 'users',
            auditable: $user,
            description: 'Data pengguna diperbarui.',
            before: $before,
            after: $after,
        );

        if ($beforeRoles !== $afterRoles) {
            $this->auditLogService->log(
                event: 'user.role_changed',
                module: 'users',
                auditable: $user,
                description: 'Role pengguna diperbarui.',
                before: ['roles' => array_values($beforeRoles)],
                after: ['roles' => array_values($afterRoles)],
            );
        }

        // render view
        return to_route('users.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $ids = explode(',', $id);
        $users = User::query()->with('roles')->whereIn('id', $ids)->get();

        foreach ($users as $user) {
            $this->auditLogService->log(
                event: 'user.deleted',
                module: 'users',
                auditable: $user,
                description: 'Pengguna dihapus.',
                before: $this->userPayload($user, $user->roles->pluck('name')->all(), false),
            );
        }

        User::whereIn('id', $ids)->delete();

        // render view
        return back();
    }

    /**
     * Impersonate a user — superadmin login as user without password.
     */
    public function impersonate(User $user)
    {
        $admin = auth()->user();

        // Only superadmin can impersonate
        if (! $admin || ! $admin->isGlobalAdmin()) {
            return back()->with('error', 'Akses ditolak.');
        }

        // Store impersonation state in session
        session([
            'impersonate_admin_id' => $admin->id,
            'current_store_id' => $user->store_id,
        ]);

        Auth::login($user);

        $this->auditLogService->log(
            event: 'user.impersonated',
            module: 'users',
            auditable: $user,
            description: "Superadmin {$admin->name} login sebagai {$user->name}.",
        );

        return redirect()->route('dashboard')->with('success', "Anda login sebagai {$user->name}.");
    }

    /**
     * Stop impersonating — return to admin.
     */
    public function stopImpersonate()
    {
        $adminId = session('impersonate_admin_id');

        if (! $adminId) {
            return redirect()->route('dashboard');
        }

        $admin = User::find($adminId);

        if ($admin) {
            Auth::login($admin);
            session()->forget('impersonate_admin_id');
            session()->forget('current_store_id');
        }

        return redirect()->route('users.index')->with('success', 'Kembali ke akun superadmin.');
    }

    /**
     * Reset user password (superadmin only).
     */
    public function resetPassword(Request $request, User $user)
    {
        $admin = auth()->user();

        if (! $admin || ! $admin->isGlobalAdmin()) {
            return back()->with('error', 'Akses ditolak.');
        }

        $request->validate([
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        $newPassword = $request->password ?: Str::random(12);
        $user->update(['password' => bcrypt($newPassword)]);

        $this->auditLogService->log(
            event: 'user.password_reset',
            module: 'users',
            auditable: $user,
            description: "Superadmin {$admin->name} mereset password {$user->name}.",
            after: ['email' => $user->email],
        );

        return back()->with('success', "Password {$user->name} telah direset. Beritahu user untuk login dengan password baru.");
    }

    private function userPayload(User $user, array $roles, bool $avatarChanged): array
    {
        return [
            'name' => $user->name,
            'email' => $user->email,
            'avatar_changed' => $avatarChanged,
            'roles' => array_values($roles),
        ];
    }
}
