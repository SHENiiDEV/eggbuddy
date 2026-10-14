<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('first_name', 60);
            $table->string('last_name', 60);
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('phone', 20);
            $table->date('date_of_birth');

            // Billing address, required by the payment provider for card payments.
            $table->string('address_line', 160);
            $table->string('city', 80);
            $table->char('country', 2);
            $table->string('postcode', 20);

            // Record of the Terms & Privacy acceptance given at sign-up.
            $table->timestamp('terms_accepted_at');
            $table->string('terms_version', 20);
            $table->string('terms_ip', 45)->nullable();

            $table->unsignedInteger('coins')->default(0);
            $table->string('pet_skin', 40);
            $table->string('shell_skin', 40);

            $table->timestamp('last_login_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};
