<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Builds the standard Orynn response envelope:
 * { "success": bool, "message": string, "data"|"errors": ... }.
 */
final class ApiResponse
{
    /**
     * @param  array<string, mixed>  $extra  Additional top-level keys, e.g. "warnings" or "meta".
     */
    public static function success(mixed $data = null, string $message = 'Request successful.', int $status = 200, array $extra = []): JsonResponse
    {
        return response()->json(['success' => true, 'message' => $message, 'data' => $data] + $extra, $status);
    }

    /**
     * @param  class-string<\Illuminate\Http\Resources\Json\JsonResource>  $resource
     */
    public static function paginated(LengthAwarePaginator $paginator, string $resource): JsonResponse
    {
        return self::success($resource::collection($paginator->getCollection()), extra: [
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    /**
     * @param  array<string, list<string>>|null  $errors
     * @param  array<string, string>  $headers
     */
    public static function error(string $message, int $status, ?array $errors = null, array $headers = []): JsonResponse
    {
        $body = ['success' => false, 'message' => $message];

        if ($errors !== null) {
            $body['errors'] = $errors;
        }

        return response()->json($body, $status, $headers);
    }
}
