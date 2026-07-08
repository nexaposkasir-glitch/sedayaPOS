<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubscriptionHistory extends Model
{
    use HasFactory;

    protected $table = 'subscription_histories';

    protected $fillable = [
        'store_id', 'plan_id', 'action', 'changed_by', 'reason', 'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public const ACTION_ACTIVATED = 'activated';
    public const ACTION_CHANGED = 'changed';
    public const ACTION_EXTENDED = 'extended';
    public const ACTION_SUSPENDED = 'suspended';
    public const ACTION_RESUMED = 'resumed';
    public const ACTION_CANCELLED = 'cancelled';
    public const ACTION_MANUAL_ACTIVATED = 'manual_activated';

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function changer()
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
