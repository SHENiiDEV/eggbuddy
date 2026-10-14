<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pet extends Model
{
    public const STATUS_EGG = 'egg';

    public const STATUS_ALIVE = 'alive';

    public const STATUS_DEPARTED = 'departed';

    protected $fillable = [
        'name', 'skin', 'status', 'stage', 'form',
        'hunger', 'happiness', 'energy', 'hygiene', 'health',
        'weight', 'poop', 'poop_timer', 'is_sick', 'is_asleep', 'care_mistakes', 'games_won',
        'hatched_at', 'simulated_at', 'departed_at', 'departed_reason', 'departed_age_hours',
    ];

    protected function casts(): array
    {
        return [
            'hunger' => 'float',
            'happiness' => 'float',
            'energy' => 'float',
            'hygiene' => 'float',
            'health' => 'float',
            'poop_timer' => 'float',
            'weight' => 'integer',
            'poop' => 'integer',
            'care_mistakes' => 'integer',
            'games_won' => 'integer',
            'is_sick' => 'boolean',
            'is_asleep' => 'boolean',
            'hatched_at' => 'datetime',
            'simulated_at' => 'datetime',
            'departed_at' => 'datetime',
            'departed_age_hours' => 'float',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isEgg(): bool
    {
        return $this->status === self::STATUS_EGG;
    }

    public function isAlive(): bool
    {
        return $this->status === self::STATUS_ALIVE;
    }

    public function isDeparted(): bool
    {
        return $this->status === self::STATUS_DEPARTED;
    }
}
