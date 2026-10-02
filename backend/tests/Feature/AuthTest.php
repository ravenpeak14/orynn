<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_and_receives_default_categories(): void
    {
        $response = $this->fromFrontend()->postJson('/api/register', [
            'name' => 'Samuel',
            'email' => 'Samuel@Example.com',
            'password' => 'StrongPassword123!',
            'password_confirmation' => 'StrongPassword123!',
            'timezone' => 'Asia/Jakarta',
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.email', 'samuel@example.com')
            ->assertJsonPath('data.timezone', 'Asia/Jakarta')
            ->assertJsonMissingPath('data.password');

        $user = User::firstWhere('email', 'samuel@example.com');
        $this->assertAuthenticatedAs($user, 'web');
        $this->assertSame(
            ['Sport', 'University', 'Work', 'Study', 'Personal', 'Other'],
            $user->categories()->orderBy('id')->pluck('name')->all(),
        );
        $this->assertNotSame('StrongPassword123!', $user->password);
    }

    public function test_registration_is_validated(): void
    {
        User::factory()->create(['email' => 'taken@example.com']);

        $this->fromFrontend()->postJson('/api/register', [
            'name' => '',
            'email' => 'taken@example.com',
            'password' => 'short',
            'password_confirmation' => 'different',
            'timezone' => 'Mars/Olympus',
        ])
            ->assertUnprocessable()
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Validation failed.')
            ->assertJsonValidationErrors(['name', 'email', 'password', 'timezone']);
    }

    public function test_user_can_login_and_logout(): void
    {
        $user = User::factory()->create(['email' => 'samuel@example.com']);

        $login = $this->fromFrontend()->postJson('/api/login', [
            'email' => 'samuel@example.com',
            'password' => 'password',
        ])->assertOk()->assertJsonPath('data.id', $user->id);

        // Replay the session cookie like a browser would, with fresh guards per
        // request (guards otherwise cache the user between test requests).
        $cookie = config('session.cookie');
        $session = $login->getCookie($cookie)->getValue();
        $request = function () use ($cookie, $session) {
            $this->app['auth']->forgetGuards();

            return $this->fromFrontend()->withCookie($cookie, $session);
        };

        $request()->getJson('/api/me')->assertOk()->assertJsonPath('data.id', $user->id);
        $request()->postJson('/api/logout')->assertOk()->assertJsonPath('success', true);
        $request()->getJson('/api/me')->assertUnauthorized();
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create(['email' => 'samuel@example.com']);

        $this->fromFrontend()->postJson('/api/login', [
            'email' => 'samuel@example.com',
            'password' => 'wrong-password',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);

        $this->assertGuest('web');
    }

    public function test_login_is_rate_limited(): void
    {
        User::factory()->create(['email' => 'samuel@example.com']);

        for ($attempt = 1; $attempt <= 5; $attempt++) {
            $this->postJson('/api/login', ['email' => 'samuel@example.com', 'password' => 'wrong'])
                ->assertUnprocessable();
        }

        $this->postJson('/api/login', ['email' => 'samuel@example.com', 'password' => 'wrong'])
            ->assertTooManyRequests()
            ->assertJsonPath('success', false)
            ->assertHeader('Retry-After');
    }

    public function test_protected_endpoints_require_authentication(): void
    {
        foreach (['/api/me', '/api/timeline', '/api/schedules', '/api/schedule-templates', '/api/schedule-overrides', '/api/categories'] as $uri) {
            $this->getJson($uri)
                ->assertUnauthorized()
                ->assertExactJson(['success' => false, 'message' => 'Unauthenticated.']);
        }
    }

    public function test_api_errors_use_the_standard_envelope_and_security_headers(): void
    {
        $this->actingAs(User::factory()->create())
            ->getJson('/api/schedules/999')
            ->assertNotFound()
            ->assertExactJson(['success' => false, 'message' => 'Resource not found.'])
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'DENY');
    }
}
