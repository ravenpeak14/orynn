<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ScheduleTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(array $overrides = []): array
    {
        return array_merge([
            'title' => 'Dentist',
            'description' => 'Routine checkup',
            'date' => '2026-09-28',
            'start_time' => '14:00',
            'end_time' => '15:00',
            'reminder_minutes' => 30,
        ], $overrides);
    }

    public function test_user_can_create_a_one_off_schedule(): void
    {
        $category = Category::factory()->for($this->user)->create(['name' => 'Personal']);

        $this->actingAs($this->user)
            ->postJson('/api/schedules', $this->payload(['category_id' => $category->id]))
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.title', 'Dentist')
            ->assertJsonPath('data.date', '2026-09-28')
            ->assertJsonPath('data.start_time', '14:00')
            ->assertJsonPath('data.end_time', '15:00')
            ->assertJsonPath('data.duration_minutes', 60)
            ->assertJsonPath('data.status', 'scheduled')
            ->assertJsonPath('data.category.name', 'Personal')
            ->assertJsonMissingPath('warnings');

        $this->assertDatabaseHas('schedules', ['user_id' => $this->user->id, 'title' => 'Dentist']);
    }

    public function test_ownership_is_assigned_server_side(): void
    {
        $other = User::factory()->create();

        $this->actingAs($this->user)
            ->postJson('/api/schedules', $this->payload(['user_id' => $other->id]))
            ->assertCreated();

        $this->assertSame(1, $this->user->schedules()->count());
        $this->assertSame(0, $other->schedules()->count());
    }

    public function test_end_time_must_be_after_start_time(): void
    {
        $this->actingAs($this->user)
            ->postJson('/api/schedules', $this->payload(['start_time' => '20:00', 'end_time' => '18:00']))
            ->assertUnprocessable()
            ->assertJsonPath('errors.end_time.0', 'The end time must be later than the start time.');
    }

    public function test_input_formats_are_validated(): void
    {
        $this->actingAs($this->user)
            ->postJson('/api/schedules', $this->payload([
                'title' => str_repeat('a', 256),
                'date' => '28-09-2026',
                'start_time' => '7:00',
                'reminder_minutes' => 7,
            ]))
            ->assertJsonValidationErrors(['title', 'date', 'start_time', 'reminder_minutes']);
    }

    public function test_another_users_category_is_rejected(): void
    {
        $foreignCategory = Category::factory()->create();

        $this->actingAs($this->user)
            ->postJson('/api/schedules', $this->payload(['category_id' => $foreignCategory->id]))
            ->assertJsonValidationErrors(['category_id']);
    }

    public function test_zero_reminder_is_stored_as_no_reminder(): void
    {
        $this->actingAs($this->user)
            ->postJson('/api/schedules', $this->payload(['reminder_minutes' => 0]))
            ->assertCreated()
            ->assertJsonPath('data.reminder_minutes', null);

        $this->assertNull(Schedule::first()->reminder_minutes);
    }

    public function test_overlapping_schedules_are_allowed_with_a_warning(): void
    {
        Schedule::factory()->for($this->user)->create(['title' => 'Meeting', 'start_time' => '14:30', 'end_time' => '15:30']);

        $this->actingAs($this->user)
            ->postJson('/api/schedules', $this->payload())
            ->assertCreated()
            ->assertJsonPath('warnings.0', 'Overlaps with Meeting (14:30–15:30).');
    }

    public function test_user_can_update_and_delete_a_schedule(): void
    {
        $schedule = Schedule::factory()->for($this->user)->create();

        $this->actingAs($this->user)
            ->putJson("/api/schedules/{$schedule->id}", $this->payload(['title' => 'Dentist (moved)', 'start_time' => '16:00', 'end_time' => '17:00']))
            ->assertOk()
            ->assertJsonPath('data.title', 'Dentist (moved)')
            ->assertJsonPath('data.start_time', '16:00');

        $this->actingAs($this->user)
            ->deleteJson("/api/schedules/{$schedule->id}")
            ->assertOk()
            ->assertJsonPath('data', null);

        $this->assertModelMissing($schedule);
    }

    public function test_user_can_change_the_status(): void
    {
        $schedule = Schedule::factory()->for($this->user)->create();

        $this->actingAs($this->user)
            ->patchJson("/api/schedules/{$schedule->id}/status", ['status' => 'completed'])
            ->assertOk()
            ->assertJsonPath('data.status', 'completed');

        $this->actingAs($this->user)
            ->patchJson("/api/schedules/{$schedule->id}/status", ['status' => 'done'])
            ->assertJsonValidationErrors(['status']);
    }

    public function test_list_is_filtered_and_paginated(): void
    {
        Schedule::factory()->for($this->user)->create(['date' => '2026-09-28', 'title' => 'Today']);
        Schedule::factory()->for($this->user)->create(['date' => '2026-09-29', 'title' => 'Tomorrow']);
        Schedule::factory()->create(['date' => '2026-09-28', 'title' => 'Not mine']);

        $this->actingAs($this->user)
            ->getJson('/api/schedules?date=2026-09-28')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Today')
            ->assertJsonPath('meta.total', 1);
    }
}
