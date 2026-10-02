<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\ValidatesOwnership;
use App\Support\Reminder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Create or fully replace a weekly schedule template.
 */
class ScheduleTemplateRequest extends FormRequest
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
            'day_of_week' => ['required', 'integer', 'between:1,7'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'category_id' => ['nullable', 'integer', $this->owned('categories')],
            'reminder_minutes' => ['nullable', 'integer', Rule::in(Reminder::OPTIONS)],
            'is_active' => ['sometimes', 'boolean'],
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
