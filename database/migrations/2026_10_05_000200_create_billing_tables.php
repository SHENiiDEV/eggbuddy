<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            // Kept when an account is closed: payment records must be retained for accounting.
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('gateway', 30);
            $table->string('gateway_reference')->nullable()->index();
            $table->string('status', 20)->default('pending'); // pending | paid | failed | cancelled | refunded
            $table->string('package', 30);
            $table->unsignedInteger('coins');
            $table->unsignedInteger('bonus_coins')->default(0);
            $table->unsignedInteger('amount');   // minor units, VAT inclusive
            $table->char('currency', 3);
            $table->string('description');

            // Billing details snapshot sent to the payment provider.
            $table->string('billing_first_name', 60);
            $table->string('billing_last_name', 60);
            $table->string('billing_email');
            $table->string('billing_phone', 20);
            $table->date('billing_date_of_birth');
            $table->string('billing_address_line', 160);
            $table->string('billing_city', 80);
            $table->char('billing_country', 2);
            $table->string('billing_postcode', 20);

            // Consents captured at checkout.
            $table->timestamp('terms_accepted_at');
            $table->timestamp('immediate_supply_consent_at');
            $table->string('ip', 45)->nullable();
            $table->text('user_agent')->nullable();

            $table->timestamp('paid_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->string('failure_reason')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });

        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('number', 40)->unique();
            $table->unsignedSmallInteger('year');
            $table->unsignedInteger('sequence');
            $table->timestamp('issued_at');
            $table->json('seller');
            $table->json('buyer');
            $table->json('lines');
            $table->unsignedInteger('net_amount');
            $table->decimal('vat_rate', 5, 2)->default(0);
            $table->unsignedInteger('vat_amount')->default(0);
            $table->unsignedInteger('total');
            $table->char('currency', 3);
            $table->timestamps();

            $table->unique(['year', 'sequence']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('payments');
    }
};
