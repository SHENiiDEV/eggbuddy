<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSkin extends Model
{
    protected $fillable = ['user_id', 'type', 'skin'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
