<?php

namespace Database\Seeders;

use App\Actions\CreateDefaultCategories;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Demo account with a weekly routine, for trying the UI locally.
     * Login: demo@orynn.test / password123
     */
    public function run(CreateDefaultCategories $createDefaultCategories): void
    {
        if (User::where('email', 'demo@orynn.test')->exists()) {
            $this->command?->info('Demo user already exists, skipping.');

            return;
        }

        $user = User::create([
            'name' => 'Demo',
            'email' => 'demo@orynn.test',
            'password' => 'password123',
            'timezone' => 'Asia/Jakarta',
        ]);

        $createDefaultCategories($user);
        $category = $user->categories()->pluck('id', 'name');

        $routine = [
            // [days, title, start, end, category, reminder]
            [[1, 3, 5], 'Swimming Training', '07:00', '09:00', 'Sport', 15],
            [[1, 2, 3, 4, 5], 'University', '10:00', '12:00', 'University', 10],
            [[2, 4], 'Gym', '16:00', '17:30', 'Sport', null],
            [[1, 2, 3, 4], 'Coding', '19:00', '21:00', 'Study', null],
            [[6], 'Long Run', '06:00', '07:30', 'Sport', 30],
            [[7], 'Weekly Review', '20:00', '20:45', 'Personal', 5],
        ];

        foreach ($routine as [$days, $title, $start, $end, $categoryName, $reminder]) {
            foreach ($days as $day) {
                $user->scheduleTemplates()->create([
                    'title' => $title,
                    'day_of_week' => $day,
                    'start_time' => $start,
                    'end_time' => $end,
                    'category_id' => $category[$categoryName],
                    'reminder_minutes' => $reminder,
                ]);
            }
        }

        $today = CarbonImmutable::now($user->timezone);

        $user->schedules()->create([
            'title' => 'Dentist',
            'description' => 'Routine checkup',
            'date' => $today->toDateString(),
            'start_time' => '14:00',
            'end_time' => '15:00',
            'category_id' => $category['Personal'],
            'reminder_minutes' => 30,
        ]);

        $user->schedules()->create([
            'title' => 'Project deadline',
            'date' => $today->addDay()->toDateString(),
            'start_time' => '13:00',
            'end_time' => '15:00',
            'category_id' => $category['Work'],
            'reminder_minutes' => 60,
        ]);
    }
}
