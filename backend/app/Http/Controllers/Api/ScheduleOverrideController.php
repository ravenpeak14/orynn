<?php

namespace App\Http\Controllers\Api;

use App\Enums\OverrideAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreScheduleOverrideRequest;
use App\Http\Requests\UpdateScheduleOverrideRequest;
use App\Http\Resources\ScheduleOverrideResource;
use App\Models\ScheduleOverride;
use App\Models\User;
use App\Services\OverlapChecker;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Per-date exceptions to weekly templates. The template itself is never changed.
 */
class ScheduleOverrideController extends Controller
{
    public function __construct(private readonly OverlapChecker $overlaps) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'date' => ['nullable', 'date_format:Y-m-d'],
            'per_page' => ['nullable', 'integer', 'between:1,100'],
        ]);

        $overrides = $request->user()->scheduleOverrides()
            ->with('category')
            ->when($filters['date'] ?? null, fn ($query, $date) => $query->where('date', $date))
            ->orderBy('date')
            ->orderBy('id')
            ->paginate($filters['per_page'] ?? 50);

        return ApiResponse::paginated($overrides, ScheduleOverrideResource::class);
    }

    public function store(StoreScheduleOverrideRequest $request): JsonResponse
    {
        $override = $request->user()->scheduleOverrides()->create($request->validated());

        return ApiResponse::success(
            new ScheduleOverrideResource($override->load('category')),
            'Override saved.',
            201,
            OverlapChecker::extra($this->warnings($request->user(), $override)),
        );
    }

    public function update(UpdateScheduleOverrideRequest $request, int $override): JsonResponse
    {
        $model = $request->scheduleOverride();
        $model->update($request->validated());

        return ApiResponse::success(
            new ScheduleOverrideResource($model->load('category')),
            'Override updated.',
            extra: OverlapChecker::extra($this->warnings($request->user(), $model)),
        );
    }

    /**
     * Removing an override restores the normal template behaviour for that date.
     */
    public function destroy(Request $request, int $override): JsonResponse
    {
        $request->user()->scheduleOverrides()->findOrFail($override)->delete();

        return ApiResponse::success(null, 'Override removed.');
    }

    /**
     * @return list<string>
     */
    private function warnings(User $user, ScheduleOverride $override): array
    {
        if ($override->action === OverrideAction::Cancel) {
            return [];
        }

        $template = $override->template;

        return $this->overlaps->forOccurrence(
            $user,
            $override->date,
            $override->start_time ?? $template->start_time,
            $override->end_time ?? $template->end_time,
            "template-{$template->id}-{$override->date}",
        );
    }
}
