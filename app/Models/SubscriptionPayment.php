<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubscriptionPayment extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';
    public const STATUS_PAID = 'paid';
    public const STATUS_EXPIRED = 'expired';
    public const STATUS_FAILED = 'failed';
    public const STATUS_CANCELLED = 'cancelled';

    protected $table = 'subscription_payments';

    protected $fillable = [
        'store_id',
        'plan_id',
        'gateway',
        'notes',
        'duration_months',
        'external_id',
        'amount',
        'status',
        'payment_url',
        'payment_data',
        'paid_at',
        'expires_at',
    ];

    protected $casts = [
        'amount' => 'integer',
        'payment_data' => 'array',
        'paid_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function isPaid(): bool
    {
        return $this->status === self::STATUS_PAID;
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isExpired(): bool
    {
        return $this->status === self::STATUS_EXPIRED || ($this->expires_at && $this->expires_at->isPast());
    }

    public function markAsPaid(): void
    {
        $this->status = self::STATUS_PAID;
        $this->paid_at = now();
        $this->save();
    }

    public function markAsFailed(): void
    {
        $this->status = self::STATUS_FAILED;
        $this->save();
    }

    public function markAsExpired(): void
    {
        $this->status = self::STATUS_EXPIRED;
        $this->save();
    }
}
