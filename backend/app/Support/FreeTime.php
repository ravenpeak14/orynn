<?php

namespace App\Support;

/**
 * Derives free-time gaps from busy ranges. Free time is never stored.
 */
final class FreeTime
{
    /**
     * Gaps between the first and the last activity of the day. Overlapping or
     * touching ranges are merged first, so a gap only appears where nothing is
     * scheduled.
     *
     * @param  iterable<array{start_time: string, end_time: string}>  $ranges
     * @return list<array{start_time: string, end_time: string, duration_minutes: int}>
     */
    public static function between(iterable $ranges): array
    {
        $intervals = [];
        foreach ($ranges as $range) {
            $intervals[] = [Time::toMinutes($range['start_time']), Time::toMinutes($range['end_time'])];
        }

        usort($intervals, fn (array $a, array $b) => [$a[0], $a[1]] <=> [$b[0], $b[1]]);

        $gaps = [];
        $busyUntil = null;

        foreach ($intervals as [$start, $end]) {
            if ($busyUntil !== null && $start > $busyUntil) {
                $gaps[] = [
                    'start_time' => Time::fromMinutes($busyUntil),
                    'end_time' => Time::fromMinutes($start),
                    'duration_minutes' => $start - $busyUntil,
                ];
            }

            $busyUntil = $busyUntil === null ? $end : max($busyUntil, $end);
        }

        return $gaps;
    }
}
