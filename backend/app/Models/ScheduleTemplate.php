<?php

namespace App\Models;

use App\Casts\TimeOfDay;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A recurring weekly routine. It is resolved into a date when that date is
 * viewed and is never copied into future dates.
 */
class ScheduleTemplate extends Model
{
    /** @use HasFactory<\Database\Factories\ScheduleTemplateFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'category_id',
        'title',
        'description',
        'day_of_week',
        'start_time',
        'end_time',
        'reminder_minutes',
        'is_active',
    ];

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'is_active' => true,
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'day_of_week' => 'integer',
            'start_time' => TimeOfDay::class,
            'end_time' => TimeOfDay::class,
            'reminder_minutes' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return HasMany<ScheduleOverride, $this>
     */
    public function overrides(): HasMany
    {
        return $this->hasMany(ScheduleOverride::class);
    }
}
