<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_and_update_profile(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('data.email', $user->email);

        $this->actingAs($user)->putJson('/api/me', [
            'name' => 'Samuel',
            'email' => 'NEW@example.com',
            'timezone' => 'Asia/Jakarta',
        ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Samuel')
            ->assertJsonPath('data.email', 'new@example.com')
            ->assertJsonPath('data.timezone', 'Asia/Jakarta');
    }

    public function test_profile_email_must_be_unique_and_timezone_valid(): void
    {
        User::factory()->create(['email' => 'taken@example.com']);

        $this->actingAs(User::factory()->create())->putJson('/api/me', [
            'name' => 'Samuel',
            'email' => 'taken@example.com',
            'timezone' => 'Nowhere/Land',
        ])->assertJsonValidationErrors(['email', 'timezone']);
    }

    public function test_password_change_requires_the_current_password(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->putJson('/api/me/password', [
            'current_password' => 'not-my-password',
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ])->assertJsonValidationErrors(['current_password']);

        $this->actingAs($user)->putJson('/api/me/password', [
            'current_password' => 'password',
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123',
        ])->assertOk();

        $user->refresh();
        $this->assertTrue(Hash::check('NewPassword123', $user->password));
        $this->assertFalse(Hash::check('password', $user->password));
    }
}
