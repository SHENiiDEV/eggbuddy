<?php

namespace App\Billing;

use App\Exceptions\GameException;
use App\Models\CoinTransaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * Every coin movement goes through here so the balance on the user row and the
 * ledger in coin_transactions always agree.
 */
class Wallet
{
    public function credit(User $user, int $amount, string $type, string $description, ?Model $reference = null): CoinTransaction
    {
        if ($amount <= 0) {
            throw new \InvalidArgumentException('Credit amount must be positive.');
        }

        return $this->move($user, $amount, $type, $description, $reference);
    }

    public function debit(User $user, int $amount, string $type, string $description, ?Model $reference = null): CoinTransaction
    {
        if ($amount <= 0) {
            throw new \InvalidArgumentException('Debit amount must be positive.');
        }

        return $this->move($user, -$amount, $type, $description, $reference);
    }

    private function move(User $user, int $delta, string $type, string $description, ?Model $reference): CoinTransaction
    {
        return DB::transaction(function () use ($user, $delta, $type, $description, $reference) {
            $locked = User::query()->whereKey($user->getKey())->lockForUpdate()->firstOrFail();
            $balance = $locked->coins + $delta;

            if ($balance < 0) {
                throw new GameException('Not enough coins. Top up or win some in the mini-game!');
            }

            $locked->forceFill(['coins' => $balance])->save();
            $user->setAttribute('coins', $balance);

            return CoinTransaction::create([
                'user_id' => $user->getKey(),
                'amount' => $delta,
                'balance_after' => $balance,
                'type' => $type,
                'description' => $description,
                'reference_type' => $reference?->getMorphClass(),
                'reference_id' => $reference?->getKey(),
            ]);
        }, 5);
    }

    /** Coins already earned today from a given source (used for daily caps). */
    public function earnedToday(User $user, string $type): int
    {
        return (int) $user->coinTransactions()
            ->where('type', $type)
            ->where('amount', '>', 0)
            ->where('created_at', '>=', now()->startOfDay())
            ->sum('amount');
    }
}
