<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ScheduleTemplateRequest;
use App\Http\Resources\ScheduleTemplateResource;
use App\Services\OverlapChecker;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Weekly schedule templates (recurring routines).
 */
class ScheduleTemplateController extends Controller
{
    public function __construct(private readonly OverlapChecker $overlaps) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'day_of_week' => ['nullable', 'integer', 'between:1,7'],
        ]);

        $templates = $request->user()->scheduleTemplates()
            ->with('category')
            ->when($filters['day_of_week'] ?? null, fn ($query, $day) => $query->where('day_of_week', $day))
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();

        return ApiResponse::success(ScheduleTemplateResource::collection($templates));
    }

    public function store(ScheduleTemplateRequest $request): JsonResponse
    {
        $template = $request->user()->scheduleTemplates()->create($request->validated());

        return ApiResponse::success(
            new ScheduleTemplateResource($template->load('category')),
            'Weekly schedule created.',
            201,
            OverlapChecker::extra($this->overlaps->forTemplate($request->user(), $template)),
        );
    }

    public function show(Request $request, int $template): JsonResponse
    {
        $model = $request->user()->scheduleTemplates()->with('category')->findOrFail($template);

        return ApiResponse::success(new ScheduleTemplateResource($model));
    }

    public function update(ScheduleTemplateRequest $request, int $template): JsonResponse
    {
        $model = $request->user()->scheduleTemplates()->findOrFail($template);
        $model->update($request->validated());

        return ApiResponse::success(
            new ScheduleTemplateResource($model->load('category')),
            'Weekly schedule updated.',
            extra: OverlapChecker::extra($this->overlaps->forTemplate($request->user(), $model)),
        );
    }

    /**
     * Deleting a template also deletes its overrides (cascade).
     */
    public function destroy(Request $request, int $template): JsonResponse
    {
        $request->user()->scheduleTemplates()->findOrFail($template)->delete();

        return ApiResponse::success(null, 'Weekly schedule deleted.');
    }
}
