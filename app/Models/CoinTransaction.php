<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class CoinTransaction extends Model
{
    public const STARTER = 'starter';

    public const TOP_UP = 'top_up';

    public const SKIN = 'skin';

    public const ITEM = 'item';

    public const MINIGAME = 'minigame';

    public const REFUND = 'refund';

    protected $fillable = ['user_id', 'amount', 'balance_after', 'type', 'description', 'reference_type', 'reference_id'];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'balance_after' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reference(): MorphTo
    {
        return $this->morphTo();
    }
}
