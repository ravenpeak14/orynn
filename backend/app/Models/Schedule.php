<?php

namespace App\Models;

use App\Casts\TimeOfDay;
use App\Enums\ScheduleStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A one-off activity on a specific date. Recurring behaviour lives in
 * ScheduleTemplate instead.
 *
 * The `date` column is kept as a "Y-m-d" string on purpose: it is a calendar
 * date, not an instant, and must not shift with timezones.
 */
class Schedule extends Model
{
    /** @use HasFactory<\Database\Factories\ScheduleFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'category_id',
        'title',
        'description',
        'date',
        'start_time',
        'end_time',
        'reminder_minutes',
        'status',
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
            'start_time' => TimeOfDay::class,
            'end_time' => TimeOfDay::class,
            'reminder_minutes' => 'integer',
            'status' => ScheduleStatus::class,
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
}
