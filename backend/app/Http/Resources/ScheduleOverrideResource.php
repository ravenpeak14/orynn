<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Raw override fields; null means "inherited from the template". The resolved
 * occurrence is available from GET /timeline.
 *
 * @mixin \App\Models\ScheduleOverride
 */
class ScheduleOverrideResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'schedule_template_id' => $this->schedule_template_id,
            'date' => $this->date,
            'action' => $this->action->value,
            'status' => $this->status->value,
            'title' => $this->title,
            'description' => $this->description,
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'reminder_minutes' => $this->reminder_minutes,
            'category_id' => $this->category_id,
            'category' => $this->whenLoaded('category', fn ($category) => new CategoryResource($category)),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
