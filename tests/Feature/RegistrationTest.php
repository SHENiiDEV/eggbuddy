<?php

namespace Tests\Feature;

use App\Mail\WelcomeMail;
use App\Models\User;
use App\Support\Countries;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'first_name' => 'Anna',
            'last_name' => 'Bērziņa',
            'email' => 'Anna@Example.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'phone' => '+371 20 000 000',
            'date_of_birth' => now()->subYears(25)->toDateString(),
            'address_line' => 'Brīvības iela 21-4',
            'city' => 'Riga',
            'country' => 'LV',
            'postcode' => 'lv-1010',
            'terms' => true,
        ], $overrides);
    }

    public function test_registration_page_lists_countries_without_restricted_ones(): void
    {
        $this->get('/register')
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Auth/Register')
                ->has('countries')
                ->where('minAge', 18));

        $codes = Countries::codes();
        foreach (['SD', 'CD', 'IR', 'ML', 'MM', 'KP', 'SS', 'SY', 'YE', 'AF', 'BY', 'CF', 'CU', 'HT', 'IQ', 'RU', 'SO', 'VE', 'ZW'] as $code) {
            $this->assertNotContains($code, $codes, "{$code} must not be offered");
        }
        $this->assertContains('LV', $codes);
        $this->assertContains('GB', $codes);
        $this->assertGreaterThan(220, count($codes));
    }

    public function test_a_player_can_register_with_full_details(): void
    {
        Mail::fake();

        $this->post('/register', $this->payload())->assertRedirect('/play');

        $user = User::where('email', 'anna@example.com')->firstOrFail();
        $this->assertAuthenticatedAs($user);
        $this->assertSame('+37120000000', $user->phone);
        $this->assertSame('LV-1010', $user->postcode);
        $this->assertSame('Brīvības iela 21-4', $user->address_line);
        $this->assertNotNull($user->terms_accepted_at);
        $this->assertSame(config('legal.version'), $user->terms_version);
        $this->assertSame((int) config('game.starter_coins'), $user->coins);
        $this->assertSame('egg', $user->activePet->status);

        Mail::assertQueued(WelcomeMail::class, function (WelcomeMail $mail) use ($user) {
            $attachments = $mail->attachments();

            return $mail->hasTo($user->email) && count($attachments) === 2;
        });
    }

    public function test_welcome_email_attachments_are_real_pdfs(): void
    {
        $user = User::factory()->create();
        $pdf = WelcomeMail::accountConfirmationPdf($user);
        $terms = WelcomeMail::legalPdf('terms');

        $this->assertStringStartsWith('%PDF', $pdf);
        $this->assertStringStartsWith('%PDF', $terms);
    }

    public function test_all_fields_are_required(): void
    {
        $this->post('/register', [])->assertSessionHasErrors([
            'first_name', 'last_name', 'email', 'password', 'phone', 'date_of_birth',
            'address_line', 'city', 'country', 'postcode', 'terms',
        ]);
        $this->assertGuest();
    }

    public function test_restricted_countries_are_rejected(): void
    {
        foreach (['RU', 'BY', 'IR', 'KP'] as $code) {
            $this->post('/register', $this->payload(['country' => $code, 'email' => "x{$code}@example.com"]))
                ->assertSessionHasErrors('country');
        }
        $this->assertSame(0, User::count());
    }

    public function test_players_must_be_adults(): void
    {
        $this->post('/register', $this->payload(['date_of_birth' => now()->subYears(17)->toDateString()]))
            ->assertSessionHasErrors('date_of_birth');
    }

    public function test_terms_must_be_accepted(): void
    {
        $this->post('/register', $this->payload(['terms' => false]))->assertSessionHasErrors('terms');
    }

    public function test_phone_must_be_in_international_format(): void
    {
        $this->post('/register', $this->payload(['phone' => '20000000']))->assertSessionHasErrors('phone');
        $this->post('/register', $this->payload(['phone' => '0037120000000']))->assertSessionDoesntHaveErrors('phone');
    }

    public function test_login_and_logout(): void
    {
        $user = User::factory()->create(['password' => 'secret123']);

        $this->post('/login', ['email' => 'wrong@example.com', 'password' => 'nope'])->assertSessionHasErrors('email');
        $this->post('/login', ['email' => strtoupper($user->email), 'password' => 'secret123'])->assertRedirect('/play');
        $this->assertAuthenticatedAs($user);

        $this->post('/logout')->assertRedirect('/');
        $this->assertGuest();
    }

    public function test_guests_are_sent_to_login(): void
    {
        foreach (['/play', '/shop', '/top-up', '/account', '/account/payments'] as $url) {
            $this->get($url)->assertRedirect('/login');
        }
    }
}
