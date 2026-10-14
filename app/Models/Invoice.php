<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoice extends Model
{
    protected $fillable = [
        'payment_id', 'user_id', 'number', 'year', 'sequence', 'issued_at',
        'seller', 'buyer', 'lines', 'net_amount', 'vat_rate', 'vat_amount', 'total', 'currency',
    ];

    protected function casts(): array
    {
        return [
            'issued_at' => 'datetime',
            'seller' => 'array',
            'buyer' => 'array',
            'lines' => 'array',
            'net_amount' => 'integer',
            'vat_rate' => 'float',
            'vat_amount' => 'integer',
            'total' => 'integer',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'number';
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function filename(): string
    {
        return 'Invoice-'.$this->number.'.pdf';
    }
}
