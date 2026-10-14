<?php

namespace App\Http\Controllers;

use App\Exceptions\GameException;
use App\Game\Minigame;
use App\Game\PetEngine;
use App\Game\Shop;
use App\Models\Pet;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The pet screen. The page itself is an Inertia page; button presses go to
 * small JSON endpoints so the device feels instant.
 */
class PlayController extends Controller
{
    public function __construct(
        private readonly PetEngine $engine,
        private readonly Shop $shop,
        private readonly Minigame $minigame,
    ) {}

    public function show(Request $request): Response
    {
        $user = $request->user();
        $pet = $this->engine->currentPet($user);

        return Inertia::render('Play', [
            'state' => $this->state($user, $pet),
            'items' => $this->shop->itemsCatalogue(),
            'actions' => config('game.actions'),
            'minigame' => [
                'rounds' => config('game.minigame.rounds'),
                'win_threshold' => config('game.minigame.win_threshold'),
                'coins_per_win' => config('game.minigame.coins_per_win'),
                'daily_coin_cap' => config('game.minigame.daily_coin_cap'),
                'energy_cost' => config('game.minigame.energy_cost'),
            ],
            'memories' => $user->pets()->where('status', Pet::STATUS_DEPARTED)->latest('departed_at')->limit(6)->get()
                ->map(fn (Pet $p) => [
                    'name' => $this->engine->displayName($p),
                    'skin' => $p->skin,
                    'form' => $p->form,
                    'stage' => $p->stage,
                    'age_days' => (int) floor(($p->departed_age_hours ?? 0) / 24),
                    'departed_at' => $p->departed_at?->toIso8601String(),
                    'reason' => $p->departed_reason,
                ]),
            'speed' => $this->engine->speed(),
        ]);
    }

    public function state(User $user, Pet $pet): array
    {
        return [
            'pet' => $this->engine->present($pet),
            'coins' => (int) $user->coins,
            'inventory' => $this->shop->inventory($user),
            'shell' => $user->shell_skin,
            'server_time' => now()->toIso8601String(),
        ];
    }

    public function refresh(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json($this->state($user, $this->engine->currentPet($user)));
    }

    public function act(Request $request): JsonResponse
    {
        $data = $request->validate([
            'action' => ['required', Rule::in(['meal', 'snack', 'clean', 'medicine', 'pat', 'lights'])],
        ]);

        return $this->respond($request, fn (User $user, Pet $pet) => $this->engine->act($pet, $data['action']));
    }

    public function useItem(Request $request): JsonResponse
    {
        $data = $request->validate([
            'item' => ['required', 'string', Rule::in(array_keys(config('game.items')))],
        ]);

        return $this->respond($request, fn (User $user, Pet $pet) => DB::transaction(function () use ($user, $pet, $data) {
            $this->engine->assertAlive($pet);
            $this->engine->assertAwake($pet);
            $this->shop->consumeItem($user, $data['item']);

            return $this->engine->useItem($pet, $data['item']);
        }));
    }

    public function name(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'min:1', 'max:16', "regex:/^[\pL\pN][\pL\pN \-']*$/u"],
        ], ['name.regex' => 'Letters, numbers and spaces only, please.']);

        return $this->respond($request, function (User $user, Pet $pet) use ($data) {
            if ($pet->isDeparted()) {
                throw new GameException('Hatch a new egg first.');
            }
            $pet->update(['name' => trim($data['name'])]);

            return 'Hello, '.$pet->name.'!';
        });
    }

    public function newEgg(Request $request): JsonResponse
    {
        $user = $request->user();
        $pet = $this->engine->currentPet($user);

        if (! $pet->isDeparted()) {
            return response()->json(['message' => 'You already have a buddy to look after.'], 422);
        }

        $egg = $this->engine->newEgg($user);

        return response()->json(['message' => 'A new egg appeared!'] + $this->state($user, $egg));
    }

    public function startGame(Request $request): JsonResponse
    {
        return $this->respond($request, function (User $user, Pet $pet) use ($request) {
            $this->minigame->start($request->session(), $pet);

            return 'Left or right? Guess where '.$this->engine->displayName($pet).' will look!';
        });
    }

    public function guess(Request $request): JsonResponse
    {
        $data = $request->validate(['guess' => ['required', Rule::in(['left', 'right'])]]);
        $result = null;

        $response = $this->respond($request, function (User $user, Pet $pet) use ($request, $data, &$result) {
            $result = $this->minigame->guess($request->session(), $user, $pet, $data['guess']);

            return $result['correct'] ? 'Yes! You guessed it.' : 'Oops, wrong way!';
        });

        if ($result) {
            $response->setData($response->getData(true) + ['round' => $result]);
        }

        return $response;
    }

    /** Simulate, run the action, and return the fresh state (or a friendly 422). */
    private function respond(Request $request, callable $action): JsonResponse
    {
        $user = $request->user();
        $pet = $this->engine->currentPet($user);

        try {
            $message = $action($user, $pet);
        } catch (GameException $e) {
            return response()->json(['message' => $e->getMessage()] + $this->state($user->refresh(), $pet->refresh()), 422);
        }

        return response()->json(['message' => $message] + $this->state($user->refresh(), $pet->refresh()));
    }
}
