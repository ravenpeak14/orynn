<?php

namespace Tests\Unit;

use App\Support\FreeTime;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class FreeTimeTest extends TestCase
{
    /**
     * @return array<string, array{list<array{string, string}>, list<array{string, string, int}>}>
     */
    public static function cases(): array
    {
        return [
            'no activities' => [[], []],
            'single activity' => [[['07:00', '09:00']], []],
            'documented example' => [
                [['07:00', '09:00'], ['10:00', '12:00'], ['19:00', '21:00']],
                [['09:00', '10:00', 60], ['12:00', '19:00', 420]],
            ],
            'unsorted input' => [
                [['19:00', '21:00'], ['07:00', '09:00']],
                [['09:00', '19:00', 600]],
            ],
            'touching activities leave no gap' => [
                [['07:00', '09:00'], ['09:00', '10:00']],
                [],
            ],
            'overlapping activities are merged' => [
                [['07:00', '09:00'], ['08:00', '10:00'], ['11:00', '12:00']],
                [['10:00', '11:00', 60]],
            ],
            'activity contained in another' => [
                [['07:00', '12:00'], ['08:00', '09:00'], ['13:00', '14:00']],
                [['12:00', '13:00', 60]],
            ],
        ];
    }

    /**
     * @param  list<array{string, string}>  $ranges
     * @param  list<array{string, string, int}>  $expected
     */
    #[DataProvider('cases')]
    public function test_it_calculates_gaps_between_activities(array $ranges, array $expected): void
    {
        $gaps = FreeTime::between(array_map(fn (array $r) => ['start_time' => $r[0], 'end_time' => $r[1]], $ranges));

        $this->assertSame(
            array_map(fn (array $g) => ['start_time' => $g[0], 'end_time' => $g[1], 'duration_minutes' => $g[2]], $expected),
            $gaps,
        );
    }
}
