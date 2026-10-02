<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;

/**
 * Stores a wall-clock time as "HH:MM:00" and exposes it as "HH:MM", so MySQL
 * TIME columns and SQLite text columns behave the same.
 *
 * @implements CastsAttributes<string|null, string|null>
 */
class TimeOfDay implements CastsAttributes
{
    public function get(Model $model, string $key, mixed $value, array $attributes): ?string
    {
        return $value === null ? null : substr((string) $value, 0, 5);
    }

    public function set(Model $model, string $key, mixed $value, array $attributes): ?string
    {
        return $value === null ? null : substr((string) $value, 0, 5).':00';
    }
}
