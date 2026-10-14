<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<User> */
class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition(): array
    {
        return [
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => 'password1',
            'phone' => '+3712'.fake()->numerify('#######'),
            'date_of_birth' => fake()->dateTimeBetween('-60 years', '-20 years')->format('Y-m-d'),
            'address_line' => fake()->streetAddress(),
            'city' => fake()->city(),
            'country' => 'LV',
            'postcode' => 'LV-'.fake()->numerify('####'),
            'terms_accepted_at' => now(),
            'terms_version' => config('legal.version'),
            'terms_ip' => '127.0.0.1',
            'pet_skin' => config('skins.default_pet'),
            'shell_skin' => config('skins.default_shell'),
            'remember_token' => Str::random(10),
        ];
    }

    public function withCoins(int $coins): static
    {
        return $this->state(fn () => ['coins' => $coins]);
    }
}
