<?php

namespace App\Models;

use App\Support\Money;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Payment extends Model
{
    public const PENDING = 'pending';

    public const PAID = 'paid';

    public const FAILED = 'failed';

    public const CANCELLED = 'cancelled';

    public const REFUNDED = 'refunded';

    protected $fillable = [
        'user_id', 'gateway', 'gateway_reference', 'status', 'package', 'coins', 'bonus_coins',
        'amount', 'currency', 'description',
        'billing_first_name', 'billing_last_name', 'billing_email', 'billing_phone', 'billing_date_of_birth',
        'billing_address_line', 'billing_city', 'billing_country', 'billing_postcode',
        'terms_accepted_at', 'immediate_supply_consent_at', 'ip', 'user_agent',
        'paid_at', 'failed_at', 'failure_reason', 'refunded_at', 'meta',
    ];

    protected function casts(): array
    {
        return [
            'coins' => 'integer',
            'bonus_coins' => 'integer',
            'amount' => 'integer',
            'billing_date_of_birth' => 'date',
            'terms_accepted_at' => 'datetime',
            'immediate_supply_consent_at' => 'datetime',
            'paid_at' => 'datetime',
            'failed_at' => 'datetime',
            'refunded_at' => 'datetime',
            'meta' => 'array',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Payment $payment) {
            $payment->uuid ??= (string) Str::uuid();
        });
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function invoice(): HasOne
    {
        return $this->hasOne(Invoice::class);
    }

    public function totalCoins(): int
    {
        return $this->coins + $this->bonus_coins;
    }

    public function isPending(): bool
    {
        return $this->status === self::PENDING;
    }

    public function isPaid(): bool
    {
        return $this->status === self::PAID;
    }

    public function formattedAmount(): string
    {
        return Money::format($this->amount, $this->currency);
    }

    public function isExpired(): bool
    {
        return $this->isPending()
            && $this->created_at?->lt(now()->subMinutes((int) config('payments.pending_expiry_minutes', 60)));
    }

    public function displayStatus(): string
    {
        return $this->isExpired() ? 'expired' : $this->status;
    }

    public function toFrontend(): array
    {
        return [
            'id' => $this->uuid,
            'status' => $this->displayStatus(),
            'package' => $this->package,
            'description' => $this->description,
            'coins' => $this->coins,
            'bonus_coins' => $this->bonus_coins,
            'total_coins' => $this->totalCoins(),
            'amount' => $this->amount,
            'currency' => $this->currency,
            'amount_formatted' => $this->formattedAmount(),
            'created_at' => $this->created_at?->toIso8601String(),
            'paid_at' => $this->paid_at?->toIso8601String(),
            'failure_reason' => $this->failure_reason,
            'invoice' => $this->relationLoaded('invoice') && $this->invoice ? [
                'number' => $this->invoice->number,
                'url' => route('invoices.download', $this->invoice),
            ] : null,
        ];
    }
}
