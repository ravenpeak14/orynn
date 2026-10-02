<?php

namespace Database\Factories;

use App\Enums\ScheduleStatus;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Schedule>
 */
class ScheduleFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'category_id' => null,
            'title' => ucfirst(fake()->words(2, true)),
            'description' => null,
            'date' => '2026-09-28',
            'start_time' => '14:00',
            'end_time' => '15:00',
            'reminder_minutes' => null,
            'status' => ScheduleStatus::Scheduled,
        ];
    }
}
