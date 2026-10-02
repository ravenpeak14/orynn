<?php

namespace App\Models;

use App\Casts\TimeOfDay;
use App\Enums\OverrideAction;
use App\Enums\ScheduleStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * An exception for one occurrence of a weekly template. Nullable fields mean
 * "inherit from the template".
 */
class ScheduleOverride extends Model
{
    /** @use HasFactory<\Database\Factories\ScheduleOverrideFactory> */
    use HasFactory;

    /**
     * Fields that change the occurrence itself (as opposed to its status).
     */
    public const MODIFIABLE_FIELDS = ['title', 'description', 'category_id', 'start_time', 'end_time', 'reminder_minutes'];

    /**
     * @var list<string>
     */
    protected $fillable = [
        'schedule_template_id',
        'date',
        'action',
        'status',
        'title',
        'description',
        'category_id',
        'start_time',
        'end_time',
        'reminder_minutes',
    ];

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'status' => 'scheduled',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'action' => OverrideAction::class,
            'status' => ScheduleStatus::class,
            'start_time' => TimeOfDay::class,
            'end_time' => TimeOfDay::class,
            'reminder_minutes' => 'integer',
        ];
    }

    public function isModified(): bool
    {
        foreach (self::MODIFIABLE_FIELDS as $field) {
            if ($this->getAttribute($field) !== null) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<ScheduleTemplate, $this>
     */
    public function template(): BelongsTo
    {
        return $this->belongsTo(ScheduleTemplate::class, 'schedule_template_id');
    }

    /**
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
