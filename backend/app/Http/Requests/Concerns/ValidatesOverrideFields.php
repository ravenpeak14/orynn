<?php

namespace App\Http\Requests\Concerns;

use App\Enums\ScheduleStatus;
use App\Models\ScheduleOverride;
use App\Models\ScheduleTemplate;
use App\Support\Reminder;
use App\Support\Time;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

/**
 * Shared rules for fields an override may change. A null value means
 * "inherit from the template".
 */
trait ValidatesOverrideFields
{
    use ValidatesOwnership;

    /**
     * @return array<string, array<mixed>>
     */
    protected function overrideFieldRules(): array
    {
        return [
            // Cancelling is expressed through "action"; status only tracks completion.
            'status' => ['sometimes', Rule::enum(ScheduleStatus::class)->only([ScheduleStatus::Scheduled, ScheduleStatus::Completed])],
            'title' => ['sometimes', 'nullable', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'category_id' => ['sometimes', 'nullable', 'integer', $this->owned('categories')],
            'start_time' => ['sometimes', 'nullable', 'date_format:H:i'],
            'end_time' => ['sometimes', 'nullable', 'date_format:H:i'],
            'reminder_minutes' => ['sometimes', 'nullable', 'integer', Rule::in(Reminder::OPTIONS)],
        ];
    }

    /**
     * Only one of the times may be overridden, so the check has to use the
     * occurrence's final times: request value, else stored override value,
     * else the template value (BR-002).
     */
    protected function validateEffectiveTimes(Validator $validator, ScheduleTemplate $template, ?ScheduleOverride $override = null): void
    {
        $start = ($this->has('start_time') ? $this->input('start_time') : $override?->start_time) ?? $template->start_time;
        $end = ($this->has('end_time') ? $this->input('end_time') : $override?->end_time) ?? $template->end_time;

        if (Time::toMinutes($end) <= Time::toMinutes($start)) {
            $validator->errors()->add('end_time', 'The end time must be later than the start time.');
        }
    }
}
