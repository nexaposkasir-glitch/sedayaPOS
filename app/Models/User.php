<?php

namespace App\Models;

use Illuminate\Auth\MustVerifyEmail as MustVerifyEmailTrait;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, HasRoles, Notifiable {
        hasPermissionTo as protected spatieHasPermissionTo;
        checkPermissionTo as protected spatieCheckPermissionTo;
    }
    use MustVerifyEmailTrait;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
        'store_id',
        'email_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
        ];
    }

    /**
     * Accessor for avatar URL.
     */
    protected function avatar(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                if (! $value) {
                    return null;
                }

                if (
                    str_starts_with($value, 'http://') ||
                    str_starts_with($value, 'https://') ||
                    str_starts_with($value, '/storage/')
                ) {
                    return $value;
                }

                return asset('storage/'.ltrim($value, '/'));
            }
        );
    }

    /**
     *  get all permissions users
     */
    public function getPermissions()
    {
        return $this->getAllPermissions()->mapWithKeys(function ($permission) {
            return [
                $permission['name'] => true,
            ];
        });
    }

    /**
     * check role isSuperAdmin
     */
    public function isSuperAdmin()
    {
        return $this->hasRole('super-admin');
    }

    public function hasPermissionTo($permission, $guardName = null): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        return $this->spatieHasPermissionTo($permission, $guardName);
    }

    public function checkPermissionTo($permission, $guardName = null): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        return $this->spatieCheckPermissionTo($permission, $guardName);
    }

    public function cashierShifts()
    {
        return $this->hasMany(CashierShift::class);
    }

    /**
     * Get the store that the user belongs to. (legacy - single store)
     */
    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    /**
     * All stores this user has access to (multi-store).
     */
    public function stores()
    {
        return $this->belongsToMany(Store::class, 'store_user')
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * Get the current active store from session.
     */
    public function currentStore(): ?Store
    {
        $storeId = session('current_store_id');
        if (! $storeId) {
            return null;
        }
        return $this->stores()->where('store_id', $storeId)->first();
    }

    /**
     * Global admin — user without store_id who manages all stores.
     * These are platform-level super-admins (e.g., kseduh5@gmail.com).
     */
    public function isGlobalAdmin(): bool
    {
        return $this->store_id === null && $this->isSuperAdmin();
    }

    /**
     * Check if user belongs to a specific store.
     */
    public function belongsToStore(?int $storeId): bool
    {
        if ($this->isGlobalAdmin()) {
            return true; // Global admin can access any store
        }
        return $this->store_id !== null && $this->store_id === $storeId;
    }

    /**
     * Get the effective store ID for this user.
     * Returns null for global admins (they can see all stores).
     */
    public function getStoreId(): ?int
    {
        if ($this->isGlobalAdmin()) {
            return null; // null = all stores
        }
        return $this->store_id;
    }

    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }
}
