<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name', 24)->nullable();
            $table->string('skin', 40);
            $table->string('status', 12)->default('egg');   // egg | alive | departed
            $table->string('stage', 12)->default('egg');    // egg | baby | child | teen | adult
            $table->string('form', 12)->nullable();         // adult form: normal | star

            $table->double('hunger')->default(100);
            $table->double('happiness')->default(100);
            $table->double('energy')->default(100);
            $table->double('hygiene')->default(100);
            $table->double('health')->default(100);
            $table->unsignedSmallInteger('weight')->default(5);
            $table->unsignedTinyInteger('poop')->default(0);
            $table->double('poop_timer')->default(0);
            $table->boolean('is_sick')->default(false);
            $table->boolean('is_asleep')->default(false);
            $table->unsignedSmallInteger('care_mistakes')->default(0);
            $table->unsignedInteger('games_won')->default(0);

            $table->timestamp('hatched_at')->nullable();
            $table->timestamp('simulated_at');
            $table->timestamp('departed_at')->nullable();
            $table->string('departed_reason', 40)->nullable();
            $table->double('departed_age_hours')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });

        Schema::create('user_skins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type', 10); // pet | shell
            $table->string('skin', 40);
            $table->timestamps();

            $table->unique(['user_id', 'type', 'skin']);
        });

        Schema::create('user_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('item', 40);
            $table->unsignedInteger('quantity')->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'item']);
        });

        Schema::create('coin_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->integer('amount');
            $table->unsignedInteger('balance_after');
            $table->string('type', 30); // starter | top_up | skin | item | minigame | refund | adjustment
            $table->string('description');
            $table->nullableMorphs('reference');
            $table->timestamps();

            $table->index(['user_id', 'type', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coin_transactions');
        Schema::dropIfExists('user_items');
        Schema::dropIfExists('user_skins');
        Schema::dropIfExists('pets');
    }
};
