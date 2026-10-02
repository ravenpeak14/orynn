<?php

namespace App\Services;

use App\Enums\OverrideAction;
use App\Enums\ScheduleStatus;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Models\Schedule;
use App\Models\ScheduleOverride;
use App\Models\ScheduleTemplate;
use App\Models\User;
use App\Support\FreeTime;
use App\Support\Time;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

/**
 * Resolves a user's day:
 * active weekly templates for the weekday → per-date overrides applied →
 * one-off schedules added → sorted by time → free-time gaps derived.
 */
class TimelineService
{
    /**
     * @return array{date: string, day_of_week: int, schedules: list<array<string, mixed>>, free_time: list<array<string, mixed>>}
     */
    public function forDate(User $user, string $date): array
    {
        $items = $this->items($user, $date);

        return [
            'date' => $date,
            'day_of_week' => self::dayOfWeek($date),
            'schedules' => $items->all(),
            'free_time' => FreeTime::between($items->where('status', '!=', ScheduleStatus::Cancelled->value)),
        ];
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function items(User $user, string $date): Collection
    {
        $overrides = $user->scheduleOverrides()
            ->with('category')
            ->where('date', $date)
            ->get()
            ->keyBy('schedule_template_id');

        $recurring = $user->scheduleTemplates()
            ->with('category')
            ->where('day_of_week', self::dayOfWeek($date))
            ->where('is_active', true)
            ->get()
            ->map(fn (ScheduleTemplate $template) => $this->fromTemplate($template, $overrides->get($template->id), $date));

        $oneOff = $user->schedules()
            ->with('category')
            ->where('date', $date)
            ->get()
            ->map(fn (Schedule $schedule) => $this->fromSchedule($schedule));

        $items = $recurring->concat($oneOff)
            ->sortBy([['start_time', 'asc'], ['end_time', 'asc'], ['title', 'asc']])
            ->values();

        return $this->flagConflicts($items);
    }

    public static function dayOfWeek(string $date): int
    {
        return CarbonImmutable::createFromFormat('!Y-m-d', $date)->dayOfWeekIso;
    }

    /**
     * @return array<string, mixed>
     */
    private function fromTemplate(ScheduleTemplate $template, ?ScheduleOverride $override, string $date): array
    {
        // Modified fields are kept even while an occurrence is cancelled, so
        // restoring it brings the modified version back.
        $start = $override?->start_time ?? $template->start_time;
        $end = $override?->end_time ?? $template->end_time;

        $status = $override?->action === OverrideAction::Cancel
            ? ScheduleStatus::Cancelled
            : ($override?->status ?? ScheduleStatus::Scheduled);

        return [
            'key' => "template-{$template->id}-{$date}",
            'source' => 'weekly_template',
            'schedule_id' => null,
            'template_id' => $template->id,
            'override_id' => $override?->id,
            'is_modified' => $override?->isModified() ?? false,
            'title' => $override?->title ?? $template->title,
            'description' => $override?->description ?? $template->description,
            'date' => $date,
            'start_time' => $start,
            'end_time' => $end,
            'duration_minutes' => Time::duration($start, $end),
            'status' => $status->value,
            // 0 on an override explicitly switches off the template's reminder.
            'reminder_minutes' => ($override?->reminder_minutes ?? $template->reminder_minutes) ?: null,
            'category' => $this->category($override?->category_id ? $override->category : $template->category),
            'has_conflict' => false,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function fromSchedule(Schedule $schedule): array
    {
        return [
            'key' => "schedule-{$schedule->id}",
            'source' => 'manual',
            'schedule_id' => $schedule->id,
            'template_id' => null,
            'override_id' => null,
            'is_modified' => false,
            'title' => $schedule->title,
            'description' => $schedule->description,
            'date' => $schedule->date,
            'start_time' => $schedule->start_time,
            'end_time' => $schedule->end_time,
            'duration_minutes' => Time::duration($schedule->start_time, $schedule->end_time),
            'status' => $schedule->status->value,
            'reminder_minutes' => $schedule->reminder_minutes ?: null,
            'category' => $this->category($schedule->category),
            'has_conflict' => false,
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function category(?Category $category): ?array
    {
        return $category ? (new CategoryResource($category))->resolve() : null;
    }

    /**
     * Mark active items that overlap another active item (BR-009).
     *
     * @param  Collection<int, array<string, mixed>>  $items
     * @return Collection<int, array<string, mixed>>
     */
    private function flagConflicts(Collection $items): Collection
    {
        $active = $items->where('status', '!=', ScheduleStatus::Cancelled->value);

        return $items->map(function (array $item) use ($active) {
            if ($item['status'] !== ScheduleStatus::Cancelled->value) {
                $item['has_conflict'] = $active->contains(fn (array $other) => $other['key'] !== $item['key']
                    && Time::overlaps($item['start_time'], $item['end_time'], $other['start_time'], $other['end_time']));
            }

            return $item;
        });
    }
}
