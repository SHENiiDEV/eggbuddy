<?php

namespace App\Models;

use App\Support\Countries;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'phone',
        'date_of_birth',
        'address_line',
        'city',
        'country',
        'postcode',
        'terms_accepted_at',
        'terms_version',
        'terms_ip',
        'pet_skin',
        'shell_skin',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'date_of_birth' => 'date',
            'terms_accepted_at' => 'datetime',
            'last_login_at' => 'datetime',
            'coins' => 'integer',
        ];
    }

    protected function fullName(): Attribute
    {
        return Attribute::get(fn () => trim($this->first_name.' '.$this->last_name));
    }

    protected function countryName(): Attribute
    {
        return Attribute::get(fn () => Countries::name($this->country));
    }

    public function pets(): HasMany
    {
        return $this->hasMany(Pet::class);
    }

    /** The current egg or living pet (departed pets are kept as memories). */
    public function activePet(): HasOne
    {
        return $this->hasOne(Pet::class)->whereIn('status', [Pet::STATUS_EGG, Pet::STATUS_ALIVE])->latestOfMany();
    }

    public function skins(): HasMany
    {
        return $this->hasMany(UserSkin::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(UserItem::class);
    }

    public function coinTransactions(): HasMany
    {
        return $this->hasMany(CoinTransaction::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function ownsSkin(string $type, string $skin): bool
    {
        if ((int) config("skins.{$type}s.{$skin}.price", -1) === 0) {
            return true;
        }

        return $this->skins()->where('type', $type)->where('skin', $skin)->exists();
    }

    /** @return array<string, list<string>> owned skin keys grouped by type, free skins included */
    public function ownedSkins(): array
    {
        $owned = $this->skins()->get(['type', 'skin'])->groupBy('type')->map->pluck('skin');

        $result = [];
        foreach (['pet', 'shell'] as $type) {
            $free = collect(config("skins.{$type}s"))->filter(fn ($s) => (int) $s['price'] === 0)->keys();
            $result[$type] = $free->merge($owned->get($type, collect()))->unique()->values()->all();
        }

        return $result;
    }

    /** Billing snapshot used for payments and invoices. */
    public function billingDetails(): array
    {
        return [
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'date_of_birth' => $this->date_of_birth?->toDateString(),
            'address_line' => $this->address_line,
            'city' => $this->city,
            'country' => $this->country,
            'postcode' => $this->postcode,
        ];
    }

    public function hasCompleteBillingProfile(): bool
    {
        foreach ($this->billingDetails() as $value) {
            if (blank($value)) {
                return false;
            }
        }

        return Countries::isAllowed($this->country);
    }
}
