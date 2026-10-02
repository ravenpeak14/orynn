<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TimelineService;
use App\Support\ApiResponse;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TimelineController extends Controller
{
    /**
     * The resolved timeline for one date; defaults to "today" in the user's timezone.
     */
    public function __invoke(Request $request, TimelineService $timeline): JsonResponse
    {
        $validated = $request->validate([
            'date' => ['nullable', 'date_format:Y-m-d'],
        ]);

        $user = $request->user();
        $date = $validated['date'] ?? CarbonImmutable::now($user->timezone)->toDateString();

        return ApiResponse::success($timeline->forDate($user, $date));
    }
}
