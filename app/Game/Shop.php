<?php

namespace App\Game;

use App\Billing\Wallet;
use App\Exceptions\GameException;
use App\Models\CoinTransaction;
use App\Models\User;
use App\Models\UserItem;
use App\Models\UserSkin;
use Illuminate\Support\Facades\DB;

class Shop
{
    public function __construct(private readonly Wallet $wallet) {}

    public function skin(string $type, string $key): array
    {
        $skin = config("skins.{$type}s.{$key}");
        if (! in_array($type, ['pet', 'shell'], true) || ! $skin) {
            throw new GameException('That skin does not exist.');
        }

        return $skin;
    }

    public function buySkin(User $user, string $type, string $key): void
    {
        $skin = $this->skin($type, $key);

        if ($user->ownsSkin($type, $key)) {
            throw new GameException('You already own '.$skin['name'].'.');
        }

        DB::transaction(function () use ($user, $type, $key, $skin) {
            $owned = UserSkin::create(['user_id' => $user->id, 'type' => $type, 'skin' => $key]);
            $this->wallet->debit($user, (int) $skin['price'], CoinTransaction::SKIN, ucfirst($type).' skin: '.$skin['name'], $owned);
        });
    }

    public function equipSkin(User $user, string $type, string $key): void
    {
        $skin = $this->skin($type, $key);

        if (! $user->ownsSkin($type, $key)) {
            throw new GameException('Unlock '.$skin['name'].' first.');
        }

        if ($type === 'pet') {
            $user->update(['pet_skin' => $key]);
            $user->activePet()->first()?->update(['skin' => $key]);
        } else {
            $user->update(['shell_skin' => $key]);
        }
    }

    public function buyItem(User $user, string $item, int $quantity = 1): void
    {
        $config = config("game.items.{$item}");
        if (! $config) {
            throw new GameException('That treat does not exist.');
        }
        $quantity = max(1, min(10, $quantity));

        DB::transaction(function () use ($user, $item, $config, $quantity) {
            $row = UserItem::query()->firstOrCreate(['user_id' => $user->id, 'item' => $item], ['quantity' => 0]);
            $label = $quantity > 1 ? "{$quantity} × {$config['name']}" : $config['name'];
            $this->wallet->debit($user, $config['price'] * $quantity, CoinTransaction::ITEM, 'Treat: '.$label, $row);
            $row->increment('quantity', $quantity);
        });
    }

    /** Take one item out of the bag. */
    public function consumeItem(User $user, string $item): void
    {
        $affected = UserItem::query()
            ->where('user_id', $user->id)
            ->where('item', $item)
            ->where('quantity', '>', 0)
            ->decrement('quantity');

        if ($affected === 0) {
            throw new GameException("You don't have that treat. Grab one in the shop!");
        }
    }

    /** @return array<string, int> */
    public function inventory(User $user): array
    {
        return $user->items()->where('quantity', '>', 0)->pluck('quantity', 'item')->map(fn ($q) => (int) $q)->all();
    }

    public function itemsCatalogue(): array
    {
        return collect(config('game.items'))
            ->map(fn ($item, $key) => [
                'key' => $key,
                'name' => $item['name'],
                'price' => $item['price'],
                'description' => $item['description'],
                'effects' => $item['effects'],
            ])->values()->all();
    }

    public function skinsCatalogue(): array
    {
        $map = fn (string $type) => collect(config("skins.{$type}s"))
            ->map(fn ($skin, $key) => ['key' => $key, 'type' => $type] + $skin)
            ->values()->all();

        return ['pets' => $map('pet'), 'shells' => $map('shell')];
    }
}
