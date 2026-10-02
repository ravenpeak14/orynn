<?php

namespace App\Http\Resources;

use App\Support\Time;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\ScheduleTemplate
 */
class ScheduleTemplateResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'day_of_week' => $this->day_of_week,
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'duration_minutes' => Time::duration($this->start_time, $this->end_time),
            'reminder_minutes' => $this->reminder_minutes ?: null,
            'is_active' => $this->is_active,
            'category_id' => $this->category_id,
            'category' => $this->whenLoaded('category', fn ($category) => new CategoryResource($category)),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
