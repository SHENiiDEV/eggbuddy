<?php

namespace App\Game;

use App\Billing\Wallet;
use App\Exceptions\GameException;
use App\Models\CoinTransaction;
use App\Models\Pet;
use App\Models\User;
use Illuminate\Contracts\Session\Session;

/**
 * "Left or Right?" - the classic virtual pet guessing game. The pet turns one
 * way, the player guesses which. The server rolls every round, so the result
 * cannot be forged from the browser.
 */
class Minigame
{
    private const KEY = 'minigame';

    public function __construct(
        private readonly PetEngine $engine,
        private readonly Wallet $wallet,
    ) {}

    public function config(): array
    {
        return config('game.minigame');
    }

    public function state(Session $session): ?array
    {
        return $session->get(self::KEY);
    }

    public function start(Session $session, Pet $pet): array
    {
        $this->engine->assertAlive($pet);
        $this->engine->assertAwake($pet);
        $name = $this->engine->displayName($pet);
        $c = $this->config();

        if ($pet->is_sick) {
            throw new GameException("{$name} is sick and needs rest, not games.");
        }
        if ($pet->energy < $c['energy_cost']) {
            throw new GameException("{$name} is too tired to play. Try a nap first.");
        }

        $pet->energy = max(0, $pet->energy - $c['energy_cost']);
        $pet->save();

        $state = ['pet_id' => $pet->id, 'round' => 0, 'wins' => 0, 'rounds' => (int) $c['rounds']];
        $session->put(self::KEY, $state);

        return $state;
    }

    /** @param 'left'|'right' $guess */
    public function guess(Session $session, User $user, Pet $pet, string $guess): array
    {
        $state = $this->state($session);
        if (! $state || $state['pet_id'] !== $pet->id) {
            throw new GameException('Start a new game first.');
        }
        if (! in_array($guess, ['left', 'right'], true)) {
            throw new GameException('Pick left or right.');
        }

        $actual = random_int(0, 1) === 0 ? 'left' : 'right';
        $correct = $actual === $guess;
        $state['round']++;
        $state['wins'] += $correct ? 1 : 0;

        $result = [
            'round' => $state['round'],
            'rounds' => $state['rounds'],
            'guess' => $guess,
            'actual' => $actual,
            'correct' => $correct,
            'wins' => $state['wins'],
            'finished' => false,
            'reward' => null,
        ];

        if ($state['round'] >= $state['rounds']) {
            $session->forget(self::KEY);
            $result['finished'] = true;
            $result['reward'] = $this->reward($user, $pet, $state['wins']);
        } else {
            $session->put(self::KEY, $state);
        }

        return $result;
    }

    private function reward(User $user, Pet $pet, int $wins): array
    {
        $c = $this->config();
        $won = $wins >= $c['win_threshold'];

        $happiness = $wins * $c['happiness_per_win'] + ($won ? $c['win_bonus_happiness'] : 0);
        $pet->happiness = min(100, $pet->happiness + $happiness);
        $pet->weight = max(1, $pet->weight - 1);
        if ($won) {
            $pet->games_won++;
        }
        $pet->save();

        $earned = $this->wallet->earnedToday($user, CoinTransaction::MINIGAME);
        $coins = min($wins * $c['coins_per_win'], max(0, $c['daily_coin_cap'] - $earned));
        if ($coins > 0) {
            $this->wallet->credit($user, $coins, CoinTransaction::MINIGAME, "Mini-game reward ({$wins}/{$c['rounds']})", $pet);
        }

        return [
            'won' => $won,
            'coins' => $coins,
            'happiness' => $happiness,
            'daily_cap_reached' => $earned + $coins >= $c['daily_coin_cap'],
        ];
    }
}
