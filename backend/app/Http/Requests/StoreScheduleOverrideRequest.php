<?php

namespace App\Http\Requests;

use App\Enums\OverrideAction;
use App\Http\Requests\Concerns\ValidatesOverrideFields;
use App\Services\TimelineService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreScheduleOverrideRequest extends FormRequest
{
    use ValidatesOverrideFields;

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'schedule_template_id' => ['required', 'integer', $this->owned('schedule_templates')],
            'date' => ['required', 'date_format:Y-m-d'],
            'action' => ['required', Rule::enum(OverrideAction::class)],
        ] + $this->overrideFieldRules();
    }

    /**
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $template = $this->user()->scheduleTemplates()->find($this->integer('schedule_template_id'));
                $date = (string) $this->input('date');

                if ($template === null) {
                    return;
                }

                if (TimelineService::dayOfWeek($date) !== $template->day_of_week) {
                    $validator->errors()->add('date', 'The date does not fall on the weekday of this routine.');
                }

                $alreadyOverridden = $this->user()->scheduleOverrides()
                    ->where('schedule_template_id', $template->id)
                    ->where('date', $date)
                    ->exists();

                if ($alreadyOverridden) {
                    $validator->errors()->add('date', 'This occurrence already has an override. Update it instead.');
                }

                $this->validateEffectiveTimes($validator, $template);
            },
        ];
    }
}
