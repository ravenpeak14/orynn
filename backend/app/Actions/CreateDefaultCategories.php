<?php

namespace App\Actions;

use App\Models\User;

class CreateDefaultCategories
{
    /**
     * Starter categories every new account receives.
     */
    public const DEFAULTS = [
        ['name' => 'Sport', 'icon' => 'activity', 'color' => 'green'],
        ['name' => 'University', 'icon' => 'graduation-cap', 'color' => 'blue'],
        ['name' => 'Work', 'icon' => 'briefcase', 'color' => 'orange'],
        ['name' => 'Study', 'icon' => 'book-open', 'color' => 'purple'],
        ['name' => 'Personal', 'icon' => 'heart', 'color' => 'pink'],
        ['name' => 'Other', 'icon' => 'circle', 'color' => 'gray'],
    ];

    public function __invoke(User $user): void
    {
        $user->categories()->createMany(self::DEFAULTS);
    }
}
