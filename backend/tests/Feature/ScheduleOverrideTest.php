<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\ScheduleOverride;
use App\Models\ScheduleTemplate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ScheduleOverrideTest extends TestCase
{
    use RefreshDatabase;

    private const MONDAY = '2026-09-28';

    private User $user;

    private ScheduleTemplate $template;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->template = ScheduleTemplate::factory()->for($this->user)->create([
            'title' => 'Swimming Training',
            'day_of_week' => 1,
            'start_time' => '07:00',
            'end_time' => '09:00',
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function timelineItem(): array
    {
        return $this->actingAs($this->user)
            ->getJson('/api/timeline?date='.self::MONDAY)
            ->assertOk()
            ->json('data.schedules.0');
    }

    public function test_an_occurrence_can_be_cancelled_without_touching_the_template(): void
    {
        $this->actingAs($this->user)
            ->postJson('/api/schedule-overrides', [
                'schedule_template_id' => $this->template->id,
                'date' => self::MONDAY,
                'action' => 'cancel',
            ])
            ->assertCreated()
            ->assertJsonPath('data.action', 'cancel');

        $item = $this->timelineItem();
        $this->assertSame('cancelled', $item['status']);
        $this->assertNotNull($item['override_id']);

        // The following Monday is unaffected.
        $this->actingAs($this->user)
            ->getJson('/api/timeline?date=2026-10-05')
            ->assertJsonPath('data.schedules.0.status', 'scheduled')
            ->assertJsonPath('data.schedules.0.override_id', null);
    }

    public function test_an_occurrence_can_be_modified(): void
    {
        $category = Category::factory()->for($this->user)->create(['name' => 'Sport']);

        $this->actingAs($this->user)
            ->postJson('/api/schedule-overrides', [
                'schedule_template_id' => $this->template->id,
                'date' => self::MONDAY,
                'action' => 'modify',
                'start_time' => '08:00',
                'end_time' => '10:00',
                'category_id' => $category->id,
            ])
            ->assertCreated();

        $item = $this->timelineItem();
        $this->assertSame('Swimming Training', $item['title']);
        $this->assertSame('08:00', $item['start_time']);
        $this->assertSame('10:00', $item['end_time']);
        $this->assertSame('Sport', $item['category']['name']);
        $this->assertTrue($item['is_modified']);

        $this->template->refresh();
        $this->assertSame('07:00', $this->template->start_time);
    }

    public function test_an_occurrence_can_be_marked_completed_and_restored(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/schedule-overrides', [
                'schedule_template_id' => $this->template->id,
                'date' => self::MONDAY,
                'action' => 'modify',
                'status' => 'completed',
            ])
            ->assertCreated();

        $item = $this->timelineItem();
        $this->assertSame('completed', $item['status']);
        $this->assertFalse($item['is_modified']);

        $this->actingAs($this->user)
            ->patchJson('/api/schedule-overrides/'.$response->json('data.id'), ['status' => 'scheduled'])
            ->assertOk();

        $this->assertSame('scheduled', $this->timelineItem()['status']);
    }

    public function test_a_cancelled_occurrence_can_be_restored_by_removing_the_override(): void
    {
        $override = ScheduleOverride::factory()->for($this->template, 'template')->cancelled()->create(['date' => self::MONDAY]);

        $this->actingAs($this->user)
            ->deleteJson("/api/schedule-overrides/{$override->id}")
            ->assertOk();

        $item = $this->timelineItem();
        $this->assertSame('scheduled', $item['status']);
        $this->assertNull($item['override_id']);
    }

    public function test_date_must_fall_on_the_templates_weekday(): void
    {
        $this->actingAs($this->user)
            ->postJson('/api/schedule-overrides', [
                'schedule_template_id' => $this->template->id,
                'date' => '2026-09-29',
                'action' => 'cancel',
            ])
            ->assertJsonValidationErrors(['date']);
    }

    public function test_an_occurrence_can_only_have_one_override(): void
    {
        ScheduleOverride::factory()->for($this->template, 'template')->create(['date' => self::MONDAY]);

        $this->actingAs($this->user)
            ->postJson('/api/schedule-overrides', [
                'schedule_template_id' => $this->template->id,
                'date' => self::MONDAY,
                'action' => 'cancel',
            ])
            ->assertJsonValidationErrors(['date']);
    }

    public function test_another_users_template_cannot_be_overridden(): void
    {
        $foreignTemplate = ScheduleTemplate::factory()->create(['day_of_week' => 1]);

        $this->actingAs($this->user)
            ->postJson('/api/schedule-overrides', [
                'schedule_template_id' => $foreignTemplate->id,
                'date' => self::MONDAY,
                'action' => 'cancel',
            ])
            ->assertJsonValidationErrors(['schedule_template_id']);

        $this->assertDatabaseCount('schedule_overrides', 0);
    }

    public function test_times_are_validated_against_the_template(): void
    {
        // Moving only the start to 10:00 would end before it starts (template ends 09:00).
        $this->actingAs($this->user)
            ->postJson('/api/schedule-overrides', [
                'schedule_template_id' => $this->template->id,
                'date' => self::MONDAY,
                'action' => 'modify',
                'start_time' => '10:00',
            ])
            ->assertJsonValidationErrors(['end_time']);

        $override = ScheduleOverride::factory()->for($this->template, 'template')->create([
            'date' => self::MONDAY,
            'start_time' => '08:00',
            'end_time' => '10:00',
        ]);

        // The stored override end (10:00) is used when only the start changes.
        $this->actingAs($this->user)
            ->patchJson("/api/schedule-overrides/{$override->id}", ['start_time' => '09:30'])
            ->assertOk();

        $this->actingAs($this->user)
            ->patchJson("/api/schedule-overrides/{$override->id}", ['start_time' => '10:30'])
            ->assertJsonValidationErrors(['end_time']);
    }

    public function test_cancelled_is_not_a_valid_override_status(): void
    {
        $this->actingAs($this->user)
            ->postJson('/api/schedule-overrides', [
                'schedule_template_id' => $this->template->id,
                'date' => self::MONDAY,
                'action' => 'modify',
                'status' => 'cancelled',
            ])
            ->assertJsonValidationErrors(['status']);
    }

    public function test_zero_reminder_on_an_override_switches_off_the_template_reminder(): void
    {
        $this->template->update(['reminder_minutes' => 15]);

        $this->actingAs($this->user)
            ->postJson('/api/schedule-overrides', [
                'schedule_template_id' => $this->template->id,
                'date' => self::MONDAY,
                'action' => 'modify',
                'reminder_minutes' => 0,
            ])
            ->assertCreated();

        $this->assertNull($this->timelineItem()['reminder_minutes']);
    }
}
