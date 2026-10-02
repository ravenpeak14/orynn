<?php

namespace App\Http\Resources;

use App\Support\Time;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Schedule
 */
class ScheduleResource extends JsonResource
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
            'date' => $this->date,
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'duration_minutes' => Time::duration($this->start_time, $this->end_time),
            'status' => $this->status->value,
            'reminder_minutes' => $this->reminder_minutes ?: null,
            'category_id' => $this->category_id,
            'category' => $this->whenLoaded('category', fn ($category) => new CategoryResource($category)),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
