<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\ScheduleOverrideController;
use App\Http\Controllers\Api\ScheduleTemplateController;
use App\Http\Controllers\Api\TimelineController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:register');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/me', [ProfileController::class, 'show']);
    Route::put('/me', [ProfileController::class, 'update']);
    Route::put('/me/password', [ProfileController::class, 'updatePassword']);

    Route::get('/timeline', TimelineController::class);

    Route::patch('/schedules/{schedule}/status', [ScheduleController::class, 'updateStatus']);
    Route::apiResource('schedules', ScheduleController::class);

    Route::apiResource('schedule-templates', ScheduleTemplateController::class)
        ->parameters(['schedule-templates' => 'template']);

    Route::apiResource('schedule-overrides', ScheduleOverrideController::class)
        ->parameters(['schedule-overrides' => 'override'])
        ->except('show');

    Route::apiResource('categories', CategoryController::class)->except('show');
});
