<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\ValidatesOwnership;
use App\Support\Reminder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Create or fully replace a one-off schedule.
 */
class ScheduleRequest extends FormRequest
{
    use ValidatesOwnership;

    protected function prepareForValidation(): void
    {
        $this->normalizeEmptyReminder();
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'date' => ['required', 'date_format:Y-m-d'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'category_id' => ['nullable', 'integer', $this->owned('categories')],
            'reminder_minutes' => ['nullable', 'integer', Rule::in(Reminder::OPTIONS)],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'end_time.after' => 'The end time must be later than the start time.',
        ];
    }
}
