<?php

namespace App\Game;

use App\Exceptions\GameException;
use App\Models\Pet;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;

/**
 * The virtual pet's "physics". Pets are simulated lazily: whenever a player
 * looks at or touches their pet, the time since the last visit is replayed in
 * small steps. No cron job is needed and the result is deterministic.
 */
class PetEngine
{
    private const STEP_HOURS = 0.25;

    private const STATS = ['hunger', 'happiness', 'energy', 'hygiene', 'health'];

    private const MAX_POOP = 4;

    private const PAT_HAPPINESS_CAP = 70;

    public function speed(): float
    {
        return max(0.01, (float) config('game.speed', 1));
    }

    public function newEgg(User $user): Pet
    {
        return $user->pets()->create([
            'skin' => $user->pet_skin ?: config('skins.default_pet'),
            'status' => Pet::STATUS_EGG,
            'stage' => 'egg',
            'simulated_at' => now(),
        ]);
    }

    /** The player's current egg/pet, creating a first egg if they have never had one. */
    public function currentPet(User $user): Pet
    {
        $pet = $user->activePet()->first()
            ?? $user->pets()->latest('id')->first()
            ?? $this->newEgg($user);

        $this->simulate($pet);

        return $pet;
    }

    // ---------------------------------------------------------------------
    // Simulation
    // ---------------------------------------------------------------------

    public function simulate(Pet $pet, ?CarbonInterface $now = null): Pet
    {
        $now = Carbon::instance($now ?? now());

        if ($pet->isDeparted()) {
            return $pet;
        }

        if ($pet->isEgg()) {
            $hatchAt = $this->hatchesAt($pet);
            if ($now->lt($hatchAt)) {
                return $pet;
            }
            $this->hatch($pet, $hatchAt);
        }

        $from = Carbon::instance($pet->simulated_at);
        $realHours = max(0, $from->diffInSeconds($now, false)) / 3600;
        if ($realHours <= 0) {
            return $pet;
        }

        $speed = $this->speed();
        $gameHours = min($realHours * $speed, (float) config('game.max_offline_hours', 168));
        $elapsed = 0.0;

        while ($elapsed < $gameHours - 1e-9) {
            $dt = min(self::STEP_HOURS, $gameHours - $elapsed);
            $elapsed += $dt;
            $this->tick($pet, $dt);

            if ($pet->health <= 0) {
                $diedAt = $from->copy()->addSeconds((int) round($elapsed / $speed * 3600));
                $this->depart($pet, $diedAt);

                return $pet;
            }
        }

        $pet->simulated_at = $now;
        $this->updateStage($pet, $now);
        $pet->save();

        return $pet;
    }

    private function tick(Pet $pet, float $dt): void
    {
        $r = config('game.rates');
        $before = ['hunger' => $pet->hunger, 'happiness' => $pet->happiness, 'hygiene' => $pet->hygiene];

        if ($pet->is_asleep) {
            $pet->energy += $r['sleep_energy'] * $dt;
            $pet->hunger -= $r['hunger'] * $r['sleep_hunger_factor'] * $dt;
            $pet->happiness -= $r['happiness'] * 0.3 * $dt;
            $pet->hygiene -= $r['hygiene'] * 0.5 * $dt;

            if ($pet->energy >= 100) {
                $pet->energy = 100;
                $pet->is_asleep = false; // wakes up rested
            }
        } else {
            $pet->hunger -= $r['hunger'] * $dt;
            $pet->happiness -= $r['happiness'] * $dt;
            $pet->energy -= $r['energy'] * $dt;
            $pet->hygiene -= ($r['hygiene'] + 2 * $pet->poop) * $dt;

            if ($pet->energy <= 0) {
                // Passed out from exhaustion: nobody turned the lights off.
                $pet->energy = 0;
                $pet->is_asleep = true;
                $pet->care_mistakes++;
            }
        }

        // Poop happens on a schedule, awake or asleep.
        $pet->poop_timer += $dt;
        if ($pet->poop_timer >= $r['poop_every_hours']) {
            $pet->poop_timer -= $r['poop_every_hours'];
            if ($pet->poop < self::MAX_POOP) {
                $pet->poop++;
                $pet->hygiene -= $r['poop_hygiene'];
            }
        }

        $this->clamp($pet);

        // Care mistakes are counted when a need first runs out.
        if ($before['hunger'] > 0 && $pet->hunger <= 0) {
            $pet->care_mistakes++;
        }
        if ($before['happiness'] > 0 && $pet->happiness <= 0) {
            $pet->care_mistakes++;
        }
        if ($before['hygiene'] > 0 && $pet->hygiene <= 0 && ! $pet->is_sick) {
            $pet->is_sick = true;
            $pet->care_mistakes++;
        }

        // Health.
        $damage = 0;
        if ($pet->hunger <= 0) {
            $damage += $r['starving_damage'];
        }
        if ($pet->is_sick) {
            $damage += $r['sick_damage'];
        }
        if ($pet->happiness <= 0) {
            $damage += $r['sad_damage'];
        }

        $pet->health += $damage > 0 ? -$damage * $dt : $r['health_regen'] * $dt;
        $this->clamp($pet);
    }

    private function clamp(Pet $pet): void
    {
        foreach (self::STATS as $stat) {
            $pet->{$stat} = max(0, min(100, (float) $pet->{$stat}));
        }
        $pet->weight = max(1, min(99, (int) $pet->weight));
    }

    public function hatchesAt(Pet $pet): Carbon
    {
        return Carbon::instance($pet->created_at ?? now())->addSeconds((int) config('game.hatch_seconds', 60));
    }

    private function hatch(Pet $pet, CarbonInterface $at): void
    {
        $pet->fill([
            'status' => Pet::STATUS_ALIVE,
            'stage' => 'baby',
            'hatched_at' => $at,
            'simulated_at' => $at,
            'hunger' => 80,
            'happiness' => 80,
            'energy' => 100,
            'hygiene' => 100,
            'health' => 100,
            'weight' => 5,
        ]);
        $pet->save();
    }

    private function depart(Pet $pet, CarbonInterface $at): void
    {
        $reason = match (true) {
            $pet->hunger <= 0 => 'starved',
            $pet->is_sick => 'sick',
            default => 'lonely',
        };

        $pet->fill([
            'status' => Pet::STATUS_DEPARTED,
            'departed_at' => $at,
            'departed_reason' => $reason,
            'departed_age_hours' => $this->ageHours($pet, $at),
            'simulated_at' => $at,
            'is_asleep' => false,
        ]);
        $pet->save();
    }

    public function ageHours(Pet $pet, ?CarbonInterface $at = null): float
    {
        if (! $pet->hatched_at) {
            return 0;
        }

        $at = $pet->departed_at && ! $at ? $pet->departed_at : ($at ?? now());

        return max(0, Carbon::instance($pet->hatched_at)->diffInSeconds($at, false)) / 3600 * $this->speed();
    }

    public function stageFor(float $ageHours): string
    {
        $stage = 'baby';
        foreach (config('game.stages') as $name => $from) {
            if ($ageHours >= $from) {
                $stage = $name;
            }
        }

        return $stage;
    }

    private function updateStage(Pet $pet, CarbonInterface $now): void
    {
        if (! $pet->isAlive()) {
            return;
        }

        $pet->stage = $this->stageFor($this->ageHours($pet, $now));

        if ($pet->stage === 'adult' && ! $pet->form) {
            $pet->form = $pet->care_mistakes <= (int) config('game.star_form_max_mistakes', 2) ? 'star' : 'normal';
        }
    }

    // ---------------------------------------------------------------------
    // Care
    // ---------------------------------------------------------------------

    /** Apply a free care action. Returns a short message for the LCD. */
    public function act(Pet $pet, string $action): string
    {
        $this->assertAlive($pet);
        $name = $this->displayName($pet);
        $a = config('game.actions');

        if ($action === 'lights') {
            return $this->toggleSleep($pet);
        }

        $this->assertAwake($pet);

        $message = match ($action) {
            'meal' => (function () use ($pet, $a, $name) {
                if ($pet->hunger >= 95) {
                    throw new GameException("{$name} is too full for a meal.");
                }
                $this->apply($pet, $a['meal']);

                return "Yum! {$name} enjoyed the meal.";
            })(),
            'snack' => (function () use ($pet, $a, $name) {
                if ($pet->weight >= 99) {
                    throw new GameException("{$name} can't eat another snack!");
                }
                $this->apply($pet, $a['snack']);

                return "{$name} loves snacks!";
            })(),
            'clean' => (function () use ($pet, $a, $name) {
                if ($pet->poop === 0 && $pet->hygiene >= 95) {
                    throw new GameException("{$name} is already sparkling clean.");
                }
                $this->apply($pet, $a['clean']);

                return 'All clean and shiny!';
            })(),
            'medicine' => (function () use ($pet, $a, $name) {
                if (! $pet->is_sick) {
                    throw new GameException("{$name} is healthy. No medicine needed.");
                }
                $this->apply($pet, $a['medicine']);

                return "{$name} feels much better.";
            })(),
            'pat' => (function () use ($pet, $a, $name) {
                if ($pet->happiness >= self::PAT_HAPPINESS_CAP) {
                    $pet->happiness = min(100, $pet->happiness + 1);

                    return "{$name} wiggles happily.";
                }
                $pet->happiness = min(self::PAT_HAPPINESS_CAP, $pet->happiness + $a['pat']['happiness']);

                return "{$name} loves the attention!";
            })(),
            default => throw new GameException('Unknown action.'),
        };

        $this->clamp($pet);
        $pet->save();

        return $message;
    }

    private function toggleSleep(Pet $pet): string
    {
        $name = $this->displayName($pet);

        if ($pet->is_asleep) {
            $pet->is_asleep = false;
            $pet->happiness = max(0, $pet->happiness - 10);
            $pet->save();

            return "Lights on! {$name} woke up a bit grumpy.";
        }

        if ($pet->energy >= 90) {
            throw new GameException("{$name} isn't sleepy yet.");
        }

        $pet->is_asleep = true;
        $pet->save();

        return "Lights off. Sweet dreams, {$name}!";
    }

    /** Apply an effects array from config (actions or shop items). */
    public function apply(Pet $pet, array $effects): void
    {
        foreach (['hunger', 'happiness', 'energy', 'health'] as $stat) {
            if (isset($effects[$stat])) {
                $pet->{$stat} += $effects[$stat];
            }
        }
        if (isset($effects['weight'])) {
            $pet->weight += $effects['weight'];
        }
        if (! empty($effects['clean'])) {
            $pet->poop = 0;
            $pet->hygiene = 100;
        }
        if (! empty($effects['cure'])) {
            $pet->is_sick = false;
            $pet->hygiene = max($pet->hygiene, 40);
        }
        $this->clamp($pet);
    }

    public function useItem(Pet $pet, string $item): string
    {
        $this->assertAlive($pet);
        $this->assertAwake($pet);

        $config = config("game.items.{$item}");
        if (! $config) {
            throw new GameException('Unknown item.');
        }

        $effects = $config['effects'];
        if (! empty($effects['cure']) && ! $pet->is_sick && $pet->health >= 100) {
            throw new GameException($this->displayName($pet).' is perfectly healthy already.');
        }

        $this->apply($pet, $effects);
        $pet->save();

        return $this->displayName($pet).' enjoyed the '.strtolower($config['name']).'!';
    }

    public function assertAlive(Pet $pet): void
    {
        if ($pet->isEgg()) {
            throw new GameException('The egg is still warming up. Almost there!');
        }
        if ($pet->isDeparted()) {
            throw new GameException('Your buddy has gone back to Egg Planet. Hatch a new egg!');
        }
    }

    public function assertAwake(Pet $pet): void
    {
        if ($pet->is_asleep) {
            throw new GameException('Shh... '.$this->displayName($pet).' is sleeping. Turn the lights on first.');
        }
    }

    public function displayName(Pet $pet): string
    {
        return $pet->name ?: (string) config("skins.pets.{$pet->skin}.name", 'Buddy');
    }

    // ---------------------------------------------------------------------
    // Presentation
    // ---------------------------------------------------------------------

    public function present(Pet $pet): array
    {
        $age = $this->ageHours($pet);
        $stats = [];
        foreach (self::STATS as $stat) {
            $stats[$stat] = (int) ceil($pet->{$stat});
        }

        $needs = [];
        if ($pet->isAlive()) {
            if ($pet->hunger < 25) {
                $needs[] = 'hungry';
            }
            if ($pet->happiness < 25) {
                $needs[] = 'bored';
            }
            if (! $pet->is_asleep && $pet->energy < 20) {
                $needs[] = 'tired';
            }
            if ($pet->poop > 0 || $pet->hygiene < 30) {
                $needs[] = 'dirty';
            }
            if ($pet->is_sick) {
                $needs[] = 'sick';
            }
        }

        $mood = match (true) {
            ! $pet->isAlive() => $pet->status,
            $pet->is_asleep => 'sleeping',
            $pet->is_sick => 'sick',
            $pet->hunger < 15 || $pet->happiness < 15 => 'sad',
            $pet->happiness >= 70 && $pet->hunger >= 50 => 'happy',
            default => 'ok',
        };

        $nextStage = null;
        if ($pet->isAlive()) {
            foreach (config('game.stages') as $stage => $from) {
                if ($from > $age) {
                    $nextStage = ['stage' => $stage, 'in_hours' => round($from - $age, 2), 'in_seconds' => (int) ceil(($from - $age) / $this->speed() * 3600)];
                    break;
                }
            }
        }

        return [
            'id' => $pet->id,
            'name' => $this->displayName($pet),
            'has_name' => filled($pet->name),
            'skin' => $pet->skin,
            'status' => $pet->status,
            'stage' => $pet->stage,
            'form' => $pet->form,
            'stats' => $stats,
            'weight' => $pet->weight,
            'poop' => $pet->poop,
            'is_sick' => $pet->is_sick,
            'is_asleep' => $pet->is_asleep,
            'care_mistakes' => $pet->care_mistakes,
            'games_won' => $pet->games_won,
            'age_hours' => round($age, 2),
            'age_days' => (int) floor($age / 24),
            'mood' => $mood,
            'needs' => $needs,
            'next_stage' => $nextStage,
            'hatches_in' => $pet->isEgg() ? max(0, (int) ceil(now()->diffInSeconds($this->hatchesAt($pet), false))) : null,
            'hatched_at' => $pet->hatched_at?->toIso8601String(),
            'departed_at' => $pet->departed_at?->toIso8601String(),
            'departed_reason' => $pet->departed_reason,
        ];
    }
}
