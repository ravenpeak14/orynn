<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $categories = $request->user()->categories()->orderBy('id')->get();

        return ApiResponse::success(CategoryResource::collection($categories));
    }

    public function store(CategoryRequest $request): JsonResponse
    {
        $category = $request->user()->categories()->create($request->validated());

        return ApiResponse::success(new CategoryResource($category), 'Category created.', 201);
    }

    public function update(CategoryRequest $request, int $category): JsonResponse
    {
        $model = $request->user()->categories()->findOrFail($category);
        $model->update($request->validated());

        return ApiResponse::success(new CategoryResource($model), 'Category updated.');
    }

    /**
     * Schedules, templates and overrides using the category keep existing
     * without a category (FK set null).
     */
    public function destroy(Request $request, int $category): JsonResponse
    {
        $request->user()->categories()->findOrFail($category)->delete();

        return ApiResponse::success(null, 'Category deleted.');
    }
}
