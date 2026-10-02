<?php

namespace App\Http\Requests;

use App\Enums\OverrideAction;
use App\Http\Requests\Concerns\ValidatesOverrideFields;
use App\Models\ScheduleOverride;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

/**
 * Partial update: only the fields that are sent change. The template and
 * date of an override are fixed; delete and recreate it to move it.
 */
class UpdateScheduleOverrideRequest extends FormRequest
{
    use ValidatesOverrideFields;

    private ?ScheduleOverride $scheduleOverride = null;

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'action' => ['sometimes', Rule::enum(OverrideAction::class)],
        ] + $this->overrideFieldRules();
    }

    /**
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->isEmpty()) {
                    $override = $this->scheduleOverride();
                    $this->validateEffectiveTimes($validator, $override->template, $override);
                }
            },
        ];
    }

    /**
     * The override being updated, scoped to the authenticated user.
     */
    public function scheduleOverride(): ScheduleOverride
    {
        return $this->scheduleOverride ??= $this->user()->scheduleOverrides()
            ->with('template')
            ->findOrFail((int) $this->route('override'));
    }
}
