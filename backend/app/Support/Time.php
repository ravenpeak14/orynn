<?php

namespace App\Support;

/**
 * Helpers for "HH:MM" wall-clock times within a single day.
 */
final class Time
{
    public static function toMinutes(string $time): int
    {
        [$hours, $minutes] = array_map('intval', explode(':', $time));

        return $hours * 60 + $minutes;
    }

    public static function fromMinutes(int $minutes): string
    {
        return sprintf('%02d:%02d', intdiv($minutes, 60), $minutes % 60);
    }

    public static function duration(string $start, string $end): int
    {
        return self::toMinutes($end) - self::toMinutes($start);
    }

    /**
     * Ranges that only touch (09:00 end, 09:00 start) do not overlap.
     */
    public static function overlaps(string $startA, string $endA, string $startB, string $endB): bool
    {
        return self::toMinutes($startA) < self::toMinutes($endB)
            && self::toMinutes($startB) < self::toMinutes($endA);
    }
}
