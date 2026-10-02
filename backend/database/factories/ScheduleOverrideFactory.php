<?php

namespace Database\Factories;

use App\Enums\OverrideAction;
use App\Enums\ScheduleStatus;
use App\Models\ScheduleOverride;
use App\Models\ScheduleTemplate;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Use ->for($template, 'template') so the override and template share a user.
 *
 * @extends Factory<ScheduleOverride>
 */
class ScheduleOverrideFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Keep schedule_template_id first: the user_id closure reads it.
        return [
            'schedule_template_id' => ScheduleTemplate::factory(),
            'user_id' => fn (array $attributes) => ScheduleTemplate::find($attributes['schedule_template_id'])->user_id,
            'date' => '2026-09-28',
            'action' => OverrideAction::Modify,
            'status' => ScheduleStatus::Scheduled,
        ];
    }

    public function cancelled(): static
    {
        return $this->state(['action' => OverrideAction::Cancel]);
    }
}
