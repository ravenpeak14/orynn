<?php

use App\Http\Middleware\SecurityHeaders;
use App\Support\ApiResponse;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Sanctum SPA authentication (session cookie + CSRF) for the frontend.
        $middleware->statefulApi();
        $middleware->throttleApi();
        $middleware->api(append: [SecurityHeaders::class]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->shouldRenderJsonWhen(fn (Request $request) => $request->is('api/*') || $request->expectsJson());

        // Render every API error in the standard envelope without leaking internals.
        $exceptions->render(function (Throwable $e, Request $request) {
            if (! $request->is('api/*') || $e instanceof HttpResponseException) {
                return null;
            }

            if ($e instanceof ValidationException) {
                return ApiResponse::error('Validation failed.', 422, $e->errors());
            }

            if ($e instanceof AuthenticationException) {
                return ApiResponse::error('Unauthenticated.', 401);
            }

            if ($e instanceof HttpExceptionInterface) {
                $status = $e->getStatusCode();

                if ($status === 429) {
                    Log::warning('Rate limit exceeded.', ['ip' => $request->ip(), 'path' => $request->path()]);
                }

                $message = match ($status) {
                    403 => 'This action is not allowed.',
                    404 => 'Resource not found.',
                    405 => 'Method not allowed.',
                    419 => 'Your session has expired. Please refresh and try again.',
                    429 => 'Too many requests. Please try again later.',
                    default => $status >= 500 ? 'Server error.' : (Response::$statusTexts[$status] ?? 'Request failed.'),
                };

                return ApiResponse::error($message, $status, headers: $e->getHeaders());
            }

            // Keep Laravel's detailed output while developing (APP_DEBUG=true).
            return config('app.debug') ? null : ApiResponse::error('Server error.', 500);
        });
    })->create();
