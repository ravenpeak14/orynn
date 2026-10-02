<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Category extends Model
{
    /** @use HasFactory<\Database\Factories\CategoryFactory> */
    use HasFactory;

    /**
     * UI color tokens the frontend knows how to render.
     */
    public const COLORS = ['gray', 'green', 'blue', 'orange', 'purple', 'pink', 'red', 'yellow', 'teal'];

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'icon',
        'color',
    ];

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
