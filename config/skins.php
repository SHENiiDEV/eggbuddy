<?php

/*
|--------------------------------------------------------------------------
| Skins catalogue
|--------------------------------------------------------------------------
|
| Prices are in coins. A price of 0 means every player owns it from the start.
| The look of each skin (sprite, palette, shell colours) lives in
| resources/js/game/skins.js under the same key.
|
*/

return [
    'default_pet' => 'mochi',
    'default_shell' => 'strawberry',

    'pets' => [
        'mochi' => ['name' => 'Mochi', 'species' => 'blob', 'price' => 0, 'rarity' => 'common', 'blurb' => 'A squishy rice-cake buddy. Easy-going and always hungry.'],
        'pipi' => ['name' => 'Pipi', 'species' => 'chick', 'price' => 250, 'rarity' => 'common', 'blurb' => 'A lemon chick that chirps for snacks.'],
        'bunbun' => ['name' => 'Bunbun', 'species' => 'bunny', 'price' => 300, 'rarity' => 'common', 'blurb' => 'Long ears, short attention span.'],
        'neko' => ['name' => 'Neko', 'species' => 'cat', 'price' => 300, 'rarity' => 'common', 'blurb' => 'Peach kitten. Naps a lot, judges a little.'],
        'kumo' => ['name' => 'Kumo', 'species' => 'sheep', 'price' => 450, 'rarity' => 'rare', 'blurb' => 'A cloud that decided to be a sheep.'],
        'boo' => ['name' => 'Boo', 'species' => 'ghost', 'price' => 500, 'rarity' => 'rare', 'blurb' => 'A shy little ghost who loves bubble baths.'],
        'drako' => ['name' => 'Drako', 'species' => 'dragon', 'price' => 800, 'rarity' => 'epic', 'blurb' => 'Mint dragon. Breathes tiny sparkles instead of fire.'],
    ],

    'shells' => [
        'strawberry' => ['name' => 'Strawberry Milk', 'price' => 0, 'rarity' => 'common'],
        'lavender' => ['name' => 'Lavender Dream', 'price' => 200, 'rarity' => 'common'],
        'mint' => ['name' => 'Mint Cream', 'price' => 200, 'rarity' => 'common'],
        'peach' => ['name' => 'Peach Sorbet', 'price' => 200, 'rarity' => 'common'],
        'lemon' => ['name' => 'Lemon Drop', 'price' => 250, 'rarity' => 'common'],
        'sky' => ['name' => 'Cotton Sky', 'price' => 250, 'rarity' => 'common'],
        'sakura' => ['name' => 'Sakura Bloom', 'price' => 400, 'rarity' => 'rare'],
        'jelly' => ['name' => 'Clear Jelly', 'price' => 500, 'rarity' => 'rare'],
        'galaxy' => ['name' => 'Starry Night', 'price' => 900, 'rarity' => 'epic'],
    ],
];
