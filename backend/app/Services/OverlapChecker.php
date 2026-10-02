<?php

namespace App\Services;

use App\Enums\ScheduleStatus;
use App\Models\ScheduleTemplate;
use App\Models\User;
use App\Support\Time;

/**
 * Overlaps are allowed but reported back as warnings (BR-009).
 */
class OverlapChecker
{
    public function __construct(private readonly TimelineService $timeline) {}

    /**
     * Warnings for an occurrence on a date, compared with the resolved timeline.
     *
     * @param  string  $ignoreKey  Timeline key of the occurrence itself.
     * @return list<string>
     */
    public function forOccurrence(User $user, string $date, string $start, string $end, string $ignoreKey): array
    {
        return $this->timeline->items($user, $date)
            ->filter(fn (array $item) => $item['key'] !== $ignoreKey
                && $item['status'] !== ScheduleStatus::Cancelled->value
                && Time::overlaps($start, $end, $item['start_time'], $item['end_time']))
            ->map(fn (array $item) => self::message($item['title'], $item['start_time'], $item['end_time']))
            ->values()
            ->all();
    }

    /**
     * Warnings for a weekly template, compared with the other active
     * templates on the same weekday.
     *
     * @return list<string>
     */
    public function forTemplate(User $user, ScheduleTemplate $template): array
    {
        if (! $template->is_active) {
            return [];
        }

        return $user->scheduleTemplates()
            ->where('day_of_week', $template->day_of_week)
            ->where('is_active', true)
            ->whereKeyNot($template->id)
            ->get()
            ->filter(fn (ScheduleTemplate $other) => Time::overlaps($template->start_time, $template->end_time, $other->start_time, $other->end_time))
            ->map(fn (ScheduleTemplate $other) => self::message($other->title, $other->start_time, $other->end_time))
            ->values()
            ->all();
    }

    /**
     * Response keys to merge into a success envelope.
     *
     * @param  list<string>  $warnings
     * @return array<string, list<string>>
     */
    public static function extra(array $warnings): array
    {
        return $warnings === [] ? [] : ['warnings' => $warnings];
    }

    private static function message(string $title, string $start, string $end): string
    {
        return "Overlaps with {$title} ({$start}–{$end}).";
    }
}
