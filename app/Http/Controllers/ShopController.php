<?php

namespace App\Http\Controllers;

use App\Exceptions\GameException;
use App\Game\PetEngine;
use App\Game\Shop;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ShopController extends Controller
{
    public function __construct(private readonly Shop $shop, private readonly PetEngine $engine) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $pet = $this->engine->currentPet($user);

        return Inertia::render('Shop', [
            'skins' => $this->shop->skinsCatalogue(),
            'items' => $this->shop->itemsCatalogue(),
            'owned' => $user->ownedSkins(),
            'inventory' => $this->shop->inventory($user),
            'equipped' => ['pet' => $user->pet_skin, 'shell' => $user->shell_skin],
            'pet' => $this->engine->present($pet),
            'tab' => in_array($request->query('tab'), ['pets', 'shells', 'treats'], true) ? $request->query('tab') : 'pets',
        ]);
    }

    public function buySkin(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'type' => ['required', Rule::in(['pet', 'shell'])],
            'skin' => ['required', 'string', 'max:40'],
            'equip' => ['boolean'],
        ]);

        return $this->attempt(function () use ($request, $data) {
            $this->shop->buySkin($request->user(), $data['type'], $data['skin']);
            if ($request->boolean('equip')) {
                $this->shop->equipSkin($request->user(), $data['type'], $data['skin']);
            }

            return $this->shop->skin($data['type'], $data['skin'])['name'].' unlocked!';
        });
    }

    public function equipSkin(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'type' => ['required', Rule::in(['pet', 'shell'])],
            'skin' => ['required', 'string', 'max:40'],
        ]);

        return $this->attempt(function () use ($request, $data) {
            $this->shop->equipSkin($request->user(), $data['type'], $data['skin']);

            return $this->shop->skin($data['type'], $data['skin'])['name'].' equipped.';
        });
    }

    public function buyItem(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'item' => ['required', 'string', Rule::in(array_keys(config('game.items')))],
            'quantity' => ['nullable', 'integer', 'min:1', 'max:10'],
        ]);

        return $this->attempt(function () use ($request, $data) {
            $qty = (int) ($data['quantity'] ?? 1);
            $this->shop->buyItem($request->user(), $data['item'], $qty);
            $name = config("game.items.{$data['item']}.name");

            return ($qty > 1 ? "{$qty} × {$name}" : $name).' added to your bag.';
        });
    }

    private function attempt(callable $fn): RedirectResponse
    {
        try {
            return back()->with('success', $fn());
        } catch (GameException $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
