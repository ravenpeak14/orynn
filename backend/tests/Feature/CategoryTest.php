<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
    }

    public function test_user_can_manage_categories(): void
    {
        $id = $this->actingAs($this->user)
            ->postJson('/api/categories', ['name' => 'Music', 'icon' => 'music', 'color' => 'teal'])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Music')
            ->json('data.id');

        $this->actingAs($this->user)
            ->putJson("/api/categories/{$id}", ['name' => 'Band practice', 'icon' => 'music', 'color' => 'purple'])
            ->assertOk()
            ->assertJsonPath('data.color', 'purple');

        $this->actingAs($this->user)
            ->getJson('/api/categories')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Band practice');
    }

    public function test_names_are_unique_per_user_and_colors_are_tokens(): void
    {
        Category::factory()->for($this->user)->create(['name' => 'Sport']);
        Category::factory()->create(['name' => 'Work']);

        $this->actingAs($this->user)
            ->postJson('/api/categories', ['name' => 'Sport', 'color' => '#ff0000', 'icon' => 'Bad Icon!'])
            ->assertJsonValidationErrors(['name', 'color', 'icon']);

        // Another user's "Work" does not block this user.
        $this->actingAs($this->user)
            ->postJson('/api/categories', ['name' => 'Work'])
            ->assertCreated();
    }

    public function test_deleting_a_category_keeps_its_schedules(): void
    {
        $category = Category::factory()->for($this->user)->create();
        $schedule = Schedule::factory()->for($this->user)->create(['category_id' => $category->id]);

        $this->actingAs($this->user)
            ->deleteJson("/api/categories/{$category->id}")
            ->assertOk();

        $this->assertModelMissing($category);
        $this->assertNull($schedule->fresh()->category_id);
    }
}
