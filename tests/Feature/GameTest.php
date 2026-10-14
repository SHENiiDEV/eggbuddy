<?php

namespace Tests\Feature;

use App\Game\PetEngine;
use App\Models\Pet;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GameTest extends TestCase
{
    use RefreshDatabase;

    private function hatchedPet(User $user): Pet
    {
        $engine = app(PetEngine::class);
        $pet = $engine->newEgg($user);
        $this->travel(2)->minutes();

        return $engine->currentPet($user);
    }

    public function test_the_egg_hatches_after_a_minute(): void
    {
        $user = User::factory()->create();
        $engine = app(PetEngine::class);
        $engine->newEgg($user);

        $this->assertSame('egg', $engine->currentPet($user)->status);

        $this->travel(61)->seconds();
        $pet = $engine->currentPet($user);
        $this->assertSame('alive', $pet->status);
        $this->assertSame('baby', $pet->stage);
    }

    public function test_care_actions_through_the_api(): void
    {
        $user = User::factory()->create();
        $this->hatchedPet($user);

        $this->actingAs($user)->postJson('/play/act', ['action' => 'meal'])
            ->assertOk()
            ->assertJsonPath('pet.stats.hunger', 100);

        // Too full now.
        $this->postJson('/play/act', ['action' => 'meal'])->assertStatus(422)->assertJsonStructure(['message', 'pet']);

        // No medicine for a healthy pet.
        $this->postJson('/play/act', ['action' => 'medicine'])->assertStatus(422);

        $this->postJson('/play/act', ['action' => 'pat'])->assertOk();
    }

    public function test_needs_drop_over_time_and_poop_appears(): void
    {
        $user = User::factory()->create();
        $pet = $this->hatchedPet($user);
        $before = $pet->hunger;

        $this->travel(5)->hours();
        $pet = app(PetEngine::class)->currentPet($user);

        $this->assertLessThan($before, $pet->hunger);
        $this->assertGreaterThanOrEqual(1, $pet->poop);
        $this->assertSame('child', $pet->stage);
    }

    public function test_neglected_pets_eventually_leave_and_a_new_egg_can_hatch(): void
    {
        $user = User::factory()->create();
        $this->hatchedPet($user);

        $this->travel(5)->days();
        $pet = app(PetEngine::class)->currentPet($user);
        $this->assertSame('departed', $pet->status);
        $this->assertNotNull($pet->departed_reason);

        $this->actingAs($user)->postJson('/play/new-egg')->assertOk()->assertJsonPath('pet.status', 'egg');
    }

    public function test_sleeping_pets_ignore_actions_until_lights_are_on(): void
    {
        $user = User::factory()->create();
        $pet = $this->hatchedPet($user);
        $pet->update(['energy' => 50]);

        $this->actingAs($user)->postJson('/play/act', ['action' => 'lights'])->assertOk()->assertJsonPath('pet.is_asleep', true);
        $this->postJson('/play/act', ['action' => 'snack'])->assertStatus(422);
        $this->postJson('/play/act', ['action' => 'lights'])->assertOk()->assertJsonPath('pet.is_asleep', false);
    }

    public function test_well_cared_for_pets_become_star_adults(): void
    {
        $user = User::factory()->create();
        $engine = app(PetEngine::class);
        $pet = $this->hatchedPet($user);

        // Look after it every few hours for three days.
        for ($i = 0; $i < 20; $i++) {
            $this->travel(4)->hours();
            $pet = $engine->currentPet($user);
            $engine->apply($pet, ['hunger' => 100, 'happiness' => 100, 'energy' => 100, 'clean' => true]);
            $pet->save();
        }

        $pet = $engine->currentPet($user);
        $this->assertSame('adult', $pet->stage);
        $this->assertSame('star', $pet->form);
    }

    public function test_minigame_rewards_are_server_side_and_capped(): void
    {
        $user = User::factory()->create();
        $this->hatchedPet($user);
        $this->actingAs($user);

        $outcomes = [];
        for ($game = 0; $game < 12; $game++) {
            app(PetEngine::class)->currentPet($user)->update(['energy' => 100, 'hunger' => 100]);
            $this->postJson('/play/game/start')->assertOk();
            for ($round = 0; $round < 5; $round++) {
                $res = $this->postJson('/play/game/guess', ['guess' => 'left'])->assertOk();
                $outcomes[] = $res->json('round.actual');
            }
        }

        $this->assertContains('left', $outcomes);
        $this->assertContains('right', $outcomes);
        $earned = (int) $user->coinTransactions()->where('type', 'minigame')->sum('amount');
        $this->assertLessThanOrEqual(config('game.minigame.daily_coin_cap'), $earned);

        // Guessing without starting a game is refused.
        $this->postJson('/play/game/guess', ['guess' => 'left'])->assertStatus(422);
    }

    public function test_buying_and_equipping_skins(): void
    {
        $user = User::factory()->withCoins(1000)->create();
        $this->hatchedPet($user);
        $this->actingAs($user);

        $this->post('/shop/skins', ['type' => 'pet', 'skin' => 'drako', 'equip' => true])->assertSessionHas('success');
        $user->refresh();
        $this->assertSame(200, $user->coins);
        $this->assertSame('drako', $user->pet_skin);
        $this->assertSame('drako', $user->activePet->skin);

        // Cannot afford the galaxy shell.
        $this->post('/shop/skins', ['type' => 'shell', 'skin' => 'galaxy'])->assertSessionHas('error');
        $this->assertSame(200, $user->refresh()->coins);

        // Cannot equip something not owned.
        $this->post('/shop/skins/equip', ['type' => 'shell', 'skin' => 'galaxy'])->assertSessionHas('error');
    }

    public function test_treats_go_into_the_bag_and_can_be_used(): void
    {
        $user = User::factory()->withCoins(100)->create();
        $pet = $this->hatchedPet($user);
        $pet->update(['hunger' => 20]);
        $this->actingAs($user);

        $this->post('/shop/items', ['item' => 'onigiri', 'quantity' => 2])->assertSessionHas('success');
        $this->assertSame(60, $user->refresh()->coins);

        $this->postJson('/play/use', ['item' => 'onigiri'])->assertOk()->assertJsonPath('inventory.onigiri', 1);
        $this->postJson('/play/use', ['item' => 'golden_apple'])->assertStatus(422);
    }

    public function test_pages_render(): void
    {
        $user = User::factory()->create();
        $this->hatchedPet($user);
        $this->actingAs($user);

        $this->get('/play')->assertOk()->assertInertia(fn ($p) => $p->component('Play')->has('state.pet'));
        $this->get('/shop')->assertOk()->assertInertia(fn ($p) => $p->component('Shop')->has('skins.pets', 7)->has('skins.shells', 9));
        $this->get('/account')->assertOk()->assertInertia(fn ($p) => $p->component('Account/Profile'));
        $this->get('/account/payments')->assertOk()->assertInertia(fn ($p) => $p->component('Account/Payments'));
    }
}
