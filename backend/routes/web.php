<?php

use Illuminate\Support\Facades\Route;

// The backend is API-only; the Orynn UI lives in ../frontend.
Route::get('/', fn () => response()->json([
    'name' => config('app.name'),
    'api' => url('/api'),
]));
