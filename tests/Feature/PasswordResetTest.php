<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_player_can_reset_their_password(): void
    {
        Notification::fake();
        $user = User::factory()->create();

        $this->post('/forgot-password', ['email' => $user->email])->assertSessionHas('status');

        Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $notification) use ($user) {
            $this->get('/reset-password/'.$notification->token.'?email='.urlencode($user->email))->assertOk();

            $this->post('/reset-password', [
                'token' => $notification->token,
                'email' => $user->email,
                'password' => 'brandnew123',
                'password_confirmation' => 'brandnew123',
            ])->assertRedirect('/login');

            return true;
        });

        $this->post('/login', ['email' => $user->email, 'password' => 'brandnew123'])->assertRedirect('/play');
    }

    public function test_unknown_emails_get_the_same_answer(): void
    {
        $this->post('/forgot-password', ['email' => 'nobody@example.com'])->assertSessionHas('status');
    }
}
