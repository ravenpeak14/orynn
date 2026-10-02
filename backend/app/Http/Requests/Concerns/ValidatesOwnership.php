<?php

namespace App\Http\Requests\Concerns;

use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Exists;

trait ValidatesOwnership
{
    /**
     * An `exists` rule that only matches rows owned by the authenticated user,
     * so another user's IDs are rejected like IDs that do not exist.
     */
    protected function owned(string $table): Exists
    {
        return Rule::exists($table, 'id')->where('user_id', $this->user()->id);
    }

    /**
     * Treat 0 ("no reminder") the same as null on schedules and templates.
     */
    protected function normalizeEmptyReminder(): void
    {
        if (in_array($this->input('reminder_minutes'), [0, '0'], true)) {
            $this->merge(['reminder_minutes' => null]);
        }
    }
}
