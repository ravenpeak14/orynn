<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Schedule;
use App\Models\ScheduleOverride;
use App\Models\ScheduleTemplate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * IDOR / BOLA: user A must never reach user B's records by changing an ID.
 */
class OwnershipTest extends TestCase
{
    use RefreshDatabase;

    public function test_another_users_records_are_not_found(): void
    {
        $owner = User::factory()->create();
        $attacker = User::factory()->create();

        $category = Category::factory()->for($owner)->create();
        $schedule = Schedule::factory()->for($owner)->create();
        $template = ScheduleTemplate::factory()->for($owner)->create();
        $override = ScheduleOverride::factory()->for($template, 'template')->create();

        $schedulePayload = ['title' => 'Hacked', 'date' => '2026-09-28', 'start_time' => '10:00', 'end_time' => '11:00'];
        $templatePayload = ['title' => 'Hacked', 'day_of_week' => 1, 'start_time' => '10:00', 'end_time' => '11:00'];

        $requests = [
            ['GET', "/api/schedules/{$schedule->id}", []],
            ['PUT', "/api/schedules/{$schedule->id}", $schedulePayload],
            ['PATCH', "/api/schedules/{$schedule->id}/status", ['status' => 'cancelled']],
            ['DELETE', "/api/schedules/{$schedule->id}", []],
            ['GET', "/api/schedule-templates/{$template->id}", []],
            ['PUT', "/api/schedule-templates/{$template->id}", $templatePayload],
            ['DELETE', "/api/schedule-templates/{$template->id}", []],
            ['PATCH', "/api/schedule-overrides/{$override->id}", ['action' => 'cancel']],
            ['DELETE', "/api/schedule-overrides/{$override->id}", []],
            ['PUT', "/api/categories/{$category->id}", ['name' => 'Hacked']],
            ['DELETE', "/api/categories/{$category->id}", []],
        ];

        foreach ($requests as [$method, $uri, $data]) {
            $this->actingAs($attacker)
                ->json($method, $uri, $data)
                ->assertNotFound();
        }

        $this->assertModelExists($category);
        $this->assertModelExists($schedule);
        $this->assertModelExists($template);
        $this->assertModelExists($override);
        $this->assertSame('scheduled', $schedule->fresh()->status->value);
        $this->assertNotSame('Hacked', $template->fresh()->title);
    }

    public function test_lists_only_contain_own_records(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();

        Category::factory()->for($other)->create();
        Schedule::factory()->for($other)->create();
        $foreignTemplate = ScheduleTemplate::factory()->for($other)->create();
        ScheduleOverride::factory()->for($foreignTemplate, 'template')->create();

        foreach (['/api/categories', '/api/schedules', '/api/schedule-templates', '/api/schedule-overrides'] as $uri) {
            $this->actingAs($owner)->getJson($uri)->assertOk()->assertJsonCount(0, 'data');
        }

        $this->actingAs($owner)
            ->getJson('/api/timeline?date=2026-09-28')
            ->assertJsonCount(0, 'data.schedules');
    }

    public function test_non_numeric_ids_are_rejected(): void
    {
        $this->actingAs(User::factory()->create())
            ->getJson('/api/schedules/1abc')
            ->assertNotFound();
    }
}
