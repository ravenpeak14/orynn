<?php

namespace App\Http\Controllers\Api;

use App\Actions\CreateDefaultCategories;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

/**
 * Session-based authentication for the first-party SPA (Sanctum stateful mode).
 * The SPA must call GET /sanctum/csrf-cookie before logging in or registering.
 */
class AuthController extends Controller
{
    public function register(RegisterRequest $request, CreateDefaultCategories $createDefaultCategories): JsonResponse
    {
        $user = DB::transaction(function () use ($request, $createDefaultCategories) {
            $user = User::create($request->validated());
            $createDefaultCategories($user);

            return $user;
        });

        Auth::guard('web')->login($user);
        $this->regenerateSession($request);

        return ApiResponse::success(new UserResource($user), 'Account created.', 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->safe()->only(['email', 'password']);

        if (! Auth::guard('web')->attempt($credentials, $request->boolean('remember'))) {
            Log::warning('Failed login attempt.', ['email' => $credentials['email'], 'ip' => $request->ip()]);

            throw ValidationException::withMessages([
                'email' => 'These credentials do not match our records.',
            ]);
        }

        $this->regenerateSession($request);

        return ApiResponse::success(new UserResource(Auth::guard('web')->user()), 'Logged in.');
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return ApiResponse::success(null, 'Logged out.');
    }

    /**
     * Prevent session fixation. Requests that do not come from a stateful
     * frontend domain have no session, and therefore stay signed out.
     */
    private function regenerateSession(Request $request): void
    {
        if ($request->hasSession()) {
            $request->session()->regenerate();
        }
    }
}
