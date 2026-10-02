<?php

namespace Database\Factories;

use App\Models\ScheduleTemplate;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ScheduleTemplate>
 */
class ScheduleTemplateFactory extends Factory
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
            'day_of_week' => 1,
            'start_time' => '07:00',
            'end_time' => '09:00',
            'reminder_minutes' => null,
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }
}
