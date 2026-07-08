<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $fillable = [
        'name', 'slug', 'description',
        'monthly_price', 'yearly_price',
        'features', 'limits',
        'sort_order', 'is_active', 'is_default',
    ];

    protected $appends = ['is_free'];

    protected $casts = [
        'features' => 'array',
        'limits' => 'array',
        'monthly_price' => 'decimal:2',
        'yearly_price' => 'decimal:2',
        'is_active' => 'boolean',
        'is_default' => 'boolean',
    ];

    public function getIsFreeAttribute(): bool
    {
        return $this->isFree();
    }

    public function stores()
    {
        return $this->hasMany(Store::class);
    }

    public function getLimit(string $key, $default = null)
    {
        return data_get($this->limits, $key, $default);
    }

    public function getFeature(string $key, $default = null)
    {
        return data_get($this->features, $key, $default);
    }

    public function hasFeature(string $key): bool
    {
        return in_array($key, $this->features ?? []);
    }

    public function isFree(): bool
    {
        return $this->monthly_price !== null && (float) $this->monthly_price === 0.0;
    }

    public static function default(): ?self
    {
        return static::where('is_default', true)->where('is_active', true)->first();
    }
}
