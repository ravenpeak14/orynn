<?php

namespace App\Http\Controllers\Api;

use App\Enums\ScheduleStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\ScheduleRequest;
use App\Http\Requests\UpdateScheduleStatusRequest;
use App\Http\Resources\ScheduleResource;
use App\Models\Schedule;
use App\Models\User;
use App\Services\OverlapChecker;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * One-off schedules. Every query goes through the authenticated user's
 * relation, so another user's schedule is simply "not found".
 */
class ScheduleController extends Controller
{
    public function __construct(private readonly OverlapChecker $overlaps) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'date' => ['nullable', 'date_format:Y-m-d'],
            'status' => ['nullable', Rule::enum(ScheduleStatus::class)],
            'category_id' => ['nullable', 'integer'],
            'per_page' => ['nullable', 'integer', 'between:1,100'],
        ]);

        $schedules = $request->user()->schedules()
            ->with('category')
            ->when($filters['date'] ?? null, fn ($query, $date) => $query->where('date', $date))
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->when($filters['category_id'] ?? null, fn ($query, $categoryId) => $query->where('category_id', $categoryId))
            ->orderBy('date')
            ->orderBy('start_time')
            ->paginate($filters['per_page'] ?? 50);

        return ApiResponse::paginated($schedules, ScheduleResource::class);
    }

    public function store(ScheduleRequest $request): JsonResponse
    {
        $schedule = $request->user()->schedules()->create($request->validated());

        return ApiResponse::success(
            new ScheduleResource($schedule->load('category')),
            'Schedule created.',
            201,
            OverlapChecker::extra($this->warnings($request->user(), $schedule)),
        );
    }

    public function show(Request $request, int $schedule): JsonResponse
    {
        $model = $request->user()->schedules()->with('category')->findOrFail($schedule);

        return ApiResponse::success(new ScheduleResource($model));
    }

    public function update(ScheduleRequest $request, int $schedule): JsonResponse
    {
        $model = $request->user()->schedules()->findOrFail($schedule);
        $model->update($request->validated());

        return ApiResponse::success(
            new ScheduleResource($model->load('category')),
            'Schedule updated.',
            extra: OverlapChecker::extra($this->warnings($request->user(), $model)),
        );
    }

    public function destroy(Request $request, int $schedule): JsonResponse
    {
        $request->user()->schedules()->findOrFail($schedule)->delete();

        return ApiResponse::success(null, 'Schedule deleted.');
    }

    public function updateStatus(UpdateScheduleStatusRequest $request, int $schedule): JsonResponse
    {
        $model = $request->user()->schedules()->findOrFail($schedule);
        $model->update(['status' => $request->validated('status')]);

        return ApiResponse::success(new ScheduleResource($model->load('category')), 'Status updated.');
    }

    /**
     * @return list<string>
     */
    private function warnings(User $user, Schedule $schedule): array
    {
        if ($schedule->status === ScheduleStatus::Cancelled) {
            return [];
        }

        return $this->overlaps->forOccurrence($user, $schedule->date, $schedule->start_time, $schedule->end_time, "schedule-{$schedule->id}");
    }
}
