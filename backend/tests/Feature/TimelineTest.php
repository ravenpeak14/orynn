<?php

namespace Tests\Feature;

use App\Enums\ScheduleStatus;
use App\Models\Category;
use App\Models\Schedule;
use App\Models\ScheduleTemplate;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TimelineTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
    }

    public function test_it_combines_weekly_templates_and_one_off_schedules(): void
    {
        $sport = Category::factory()->for($this->user)->create(['name' => 'Sport', 'color' => 'green', 'icon' => 'activity']);

        $template = ScheduleTemplate::factory()->for($this->user)->create([
            'title' => 'Swimming Training',
            'day_of_week' => 1,
            'start_time' => '07:00',
            'end_time' => '09:00',
            'category_id' => $sport->id,
            'reminder_minutes' => 15,
        ]);
        $dentist = Schedule::factory()->for($this->user)->create([
            'title' => 'Dentist',
            'date' => '2026-09-28',
            'start_time' => '14:00',
            'end_time' => '15:00',
        ]);

        $this->actingAs($this->user)
            ->getJson('/api/timeline?date=2026-09-28')
            ->assertOk()
            ->assertJsonPath('data.date', '2026-09-28')
            ->assertJsonPath('data.day_of_week', 1)
            ->assertJsonPath('data.schedules.0', [
                'key' => "template-{$template->id}-2026-09-28",
                'source' => 'weekly_template',
                'schedule_id' => null,
                'template_id' => $template->id,
                'override_id' => null,
                'is_modified' => false,
                'title' => 'Swimming Training',
                'description' => null,
                'date' => '2026-09-28',
                'start_time' => '07:00',
                'end_time' => '09:00',
                'duration_minutes' => 120,
                'status' => 'scheduled',
                'reminder_minutes' => 15,
                'category' => ['id' => $sport->id, 'name' => 'Sport', 'icon' => 'activity', 'color' => 'green'],
                'has_conflict' => false,
            ])
            ->assertJsonPath('data.schedules.1.key', "schedule-{$dentist->id}")
            ->assertJsonPath('data.schedules.1.source', 'manual')
            ->assertJsonPath('data.schedules.1.schedule_id', $dentist->id)
            ->assertJsonPath('data.free_time', [
                ['start_time' => '09:00', 'end_time' => '14:00', 'duration_minutes' => 300],
            ]);
    }

    public function test_only_active_templates_for_the_weekday_are_resolved(): void
    {
        ScheduleTemplate::factory()->for($this->user)->create(['title' => 'Monday', 'day_of_week' => 1]);
        ScheduleTemplate::factory()->for($this->user)->create(['title' => 'Tuesday', 'day_of_week' => 2]);
        ScheduleTemplate::factory()->for($this->user)->inactive()->create(['title' => 'Paused', 'day_of_week' => 1]);
        ScheduleTemplate::factory()->create(['title' => 'Someone else', 'day_of_week' => 1]);
        Schedule::factory()->for($this->user)->create(['title' => 'Another day', 'date' => '2026-09-29']);

        $titles = collect($this->actingAs($this->user)->getJson('/api/timeline?date=2026-09-28')->json('data.schedules'))->pluck('title');

        $this->assertSame(['Monday'], $titles->all());
    }

    public function test_items_are_sorted_chronologically(): void
    {
        Schedule::factory()->for($this->user)->create(['title' => 'Coding', 'start_time' => '19:00', 'end_time' => '21:00']);
        ScheduleTemplate::factory()->for($this->user)->create(['title' => 'University', 'day_of_week' => 1, 'start_time' => '10:00', 'end_time' => '12:00']);
        Schedule::factory()->for($this->user)->create(['title' => 'Swimming', 'start_time' => '07:00', 'end_time' => '09:00']);

        $this->actingAs($this->user)
            ->getJson('/api/timeline?date=2026-09-28')
            ->assertJsonPath('data.schedules.*.title', ['Swimming', 'University', 'Coding'])
            ->assertJsonPath('data.free_time.*.start_time', ['09:00', '12:00']);
    }

    public function test_cancelled_items_do_not_count_as_busy_or_conflicting(): void
    {
        Schedule::factory()->for($this->user)->create(['title' => 'A', 'start_time' => '07:00', 'end_time' => '09:00']);
        Schedule::factory()->for($this->user)->create(['title' => 'B', 'start_time' => '08:00', 'end_time' => '09:30']);
        Schedule::factory()->for($this->user)->create(['title' => 'C', 'start_time' => '10:00', 'end_time' => '12:00', 'status' => ScheduleStatus::Cancelled]);
        Schedule::factory()->for($this->user)->create(['title' => 'D', 'start_time' => '13:00', 'end_time' => '14:00']);

        $this->actingAs($this->user)
            ->getJson('/api/timeline?date=2026-09-28')
            ->assertJsonPath('data.schedules.*.has_conflict', [true, true, false, false])
            ->assertJsonPath('data.schedules.2.status', 'cancelled')
            ->assertJsonPath('data.free_time', [
                ['start_time' => '09:30', 'end_time' => '13:00', 'duration_minutes' => 210],
            ]);
    }

    public function test_default_date_is_today_in_the_users_timezone(): void
    {
        $this->user->update(['timezone' => 'Asia/Jakarta']);

        // 20:00 UTC on the 28th is already 03:00 on the 29th in Jakarta (UTC+7).
        $this->travelTo(CarbonImmutable::parse('2026-09-28 20:00:00', 'UTC'));

        $this->actingAs($this->user)
            ->getJson('/api/timeline')
            ->assertOk()
            ->assertJsonPath('data.date', '2026-09-29')
            ->assertJsonPath('data.day_of_week', 2);
    }

    public function test_date_is_validated(): void
    {
        $this->actingAs($this->user)
            ->getJson('/api/timeline?date=tomorrow')
            ->assertJsonValidationErrors(['date']);
    }
}
