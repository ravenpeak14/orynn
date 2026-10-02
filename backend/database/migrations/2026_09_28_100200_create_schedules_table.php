<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->unsignedSmallInteger('reminder_minutes')->nullable();
            $table->string('status', 20)->default('scheduled')->index();
            $table->timestamps();

            $table->index(['user_id', 'date'], 'schedules_user_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
