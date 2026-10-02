<?php

namespace Tests\Feature;

use App\Models\ScheduleOverride;
use App\Models\ScheduleTemplate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ScheduleTemplateTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
    }

    public function test_user_can_create_a_weekly_template(): void
    {
        $this->actingAs($this->user)
            ->postJson('/api/schedule-templates', [
                'title' => 'Swimming Training',
                'description' => 'Sprint training',
                'day_of_week' => 1,
                'start_time' => '07:00',
                'end_time' => '09:00',
                'reminder_minutes' => 15,
            ])
            ->assertCreated()
            ->assertJsonPath('data.title', 'Swimming Training')
            ->assertJsonPath('data.day_of_week', 1)
            ->assertJsonPath('data.is_active', true)
            ->assertJsonPath('data.reminder_minutes', 15);
    }

    public function test_template_is_validated(): void
    {
        $this->actingAs($this->user)
            ->postJson('/api/schedule-templates', [
                'title' => 'Swimming Training',
                'day_of_week' => 8,
                'start_time' => '09:00',
                'end_time' => '07:00',
            ])
            ->assertJsonValidationErrors(['day_of_week', 'end_time']);
    }

    public function test_overlapping_template_on_the_same_day_gets_a_warning(): void
    {
        ScheduleTemplate::factory()->for($this->user)->create(['title' => 'University', 'day_of_week' => 1, 'start_time' => '10:00', 'end_time' => '12:00']);
        ScheduleTemplate::factory()->for($this->user)->create(['title' => 'Tuesday class', 'day_of_week' => 2, 'start_time' => '10:00', 'end_time' => '12:00']);

        $this->actingAs($this->user)
            ->postJson('/api/schedule-templates', [
                'title' => 'Coding',
                'day_of_week' => 1,
                'start_time' => '11:00',
                'end_time' => '13:00',
            ])
            ->assertCreated()
            ->assertJsonPath('warnings', ['Overlaps with University (10:00–12:00).']);
    }

    public function test_list_can_be_filtered_by_weekday(): void
    {
        ScheduleTemplate::factory()->for($this->user)->create(['day_of_week' => 1, 'title' => 'Monday']);
        ScheduleTemplate::factory()->for($this->user)->create(['day_of_week' => 3, 'title' => 'Wednesday']);

        $this->actingAs($this->user)
            ->getJson('/api/schedule-templates?day_of_week=3')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Wednesday');
    }

    public function test_user_can_update_a_template(): void
    {
        $template = ScheduleTemplate::factory()->for($this->user)->create();

        $this->actingAs($this->user)
            ->putJson("/api/schedule-templates/{$template->id}", [
                'title' => 'Morning swim',
                'day_of_week' => 2,
                'start_time' => '06:00',
                'end_time' => '07:30',
                'is_active' => false,
            ])
            ->assertOk()
            ->assertJsonPath('data.title', 'Morning swim')
            ->assertJsonPath('data.day_of_week', 2)
            ->assertJsonPath('data.is_active', false);
    }

    public function test_deleting_a_template_removes_its_overrides(): void
    {
        $template = ScheduleTemplate::factory()->for($this->user)->create();
        $override = ScheduleOverride::factory()->for($template, 'template')->cancelled()->create();

        $this->actingAs($this->user)
            ->deleteJson("/api/schedule-templates/{$template->id}")
            ->assertOk();

        $this->assertModelMissing($template);
        $this->assertModelMissing($override);
    }
}
