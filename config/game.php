<?php

return [

    // Multiplier for in-game time. 1 = real time; 60 = one real minute is one game hour.
    'speed' => (float) env('GAME_SPEED', 1),

    // Coins every new player receives so the shop can be tried straight away.
    'starter_coins' => 100,

    // Seconds an egg needs before it hatches.
    'hatch_seconds' => 60,

    // Longest stretch of time simulated when a player comes back (in hours).
    'max_offline_hours' => 168,

    // Life stages and the age (in game hours since hatching) at which they start.
    'stages' => [
        'baby' => 0,
        'child' => 1,
        'teen' => 24,
        'adult' => 72,
    ],

    // A pet that reaches adulthood with this many care mistakes or fewer becomes a "star" adult.
    'star_form_max_mistakes' => 2,

    // Change per game hour.
    'rates' => [
        'hunger' => 6,            // fullness lost while awake
        'happiness' => 5,
        'energy' => 4,
        'hygiene' => 3,
        'sleep_energy' => 20,     // energy regained while asleep
        'sleep_hunger_factor' => 0.35,
        'poop_every_hours' => 4,
        'poop_hygiene' => 12,
        'health_regen' => 3,
        'starving_damage' => 6,
        'sick_damage' => 3,
        'sad_damage' => 2,
    ],

    // Effects of the free care actions.
    'actions' => [
        'meal' => ['hunger' => 30, 'weight' => 1],
        'snack' => ['hunger' => 8, 'happiness' => 15, 'weight' => 2],
        'clean' => ['clean' => true, 'happiness' => 2],
        'medicine' => ['cure' => true, 'health' => 20, 'happiness' => -5],
        'pat' => ['happiness' => 6],
    ],

    // "Left or right?" mini-game.
    'minigame' => [
        'rounds' => 5,
        'win_threshold' => 3,
        'coins_per_win' => 2,
        'daily_coin_cap' => 60,
        'energy_cost' => 3,
        'happiness_per_win' => 6,
        'win_bonus_happiness' => 15,
    ],

    // Treats sold in the shop for coins and kept in the bag until used.
    'items' => [
        'onigiri' => [
            'name' => 'Onigiri',
            'price' => 20,
            'description' => 'A proper meal. Fills the tummy a lot.',
            'effects' => ['hunger' => 45, 'weight' => 1],
        ],
        'rainbow_candy' => [
            'name' => 'Rainbow candy',
            'price' => 15,
            'description' => 'Pure joy on a stick.',
            'effects' => ['happiness' => 20, 'weight' => 1],
        ],
        'strawberry_cake' => [
            'name' => 'Strawberry cake',
            'price' => 40,
            'description' => 'Fills up and cheers up.',
            'effects' => ['hunger' => 20, 'happiness' => 30, 'weight' => 2],
        ],
        'energy_milk' => [
            'name' => 'Energy milk',
            'price' => 25,
            'description' => 'Restores energy without a nap.',
            'effects' => ['energy' => 40],
        ],
        'bubble_bath' => [
            'name' => 'Bubble bath',
            'price' => 30,
            'description' => 'Sparkling clean and a little happier.',
            'effects' => ['clean' => true, 'happiness' => 10],
        ],
        'vitamin_drop' => [
            'name' => 'Vitamin drop',
            'price' => 50,
            'description' => 'Cures a cold and restores health.',
            'effects' => ['cure' => true, 'health' => 35],
        ],
        'golden_apple' => [
            'name' => 'Golden apple',
            'price' => 120,
            'description' => 'Tops up every need at once.',
            'effects' => ['hunger' => 25, 'happiness' => 25, 'energy' => 25, 'health' => 25],
        ],
    ],
];
