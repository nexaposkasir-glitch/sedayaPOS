<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToStore;

class Supplier extends Model
{
    use HasFactory, BelongsToStore;

    protected $fillable = [
        'name',
        'phone',
        'email',
        'address',
    ];

    public function payables()
    {
        return $this->hasMany(Payable::class);
    }
}
