<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedule_overrides', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('schedule_template_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->string('action', 20);
            // Completion of this single occurrence (scheduled/completed).
            $table->string('status', 20)->default('scheduled');
            // Null means "inherit from the template".
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->unsignedSmallInteger('reminder_minutes')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'date'], 'overrides_user_date');
            $table->unique(['user_id', 'schedule_template_id', 'date'], 'overrides_occurrence');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedule_overrides');
    }
};
