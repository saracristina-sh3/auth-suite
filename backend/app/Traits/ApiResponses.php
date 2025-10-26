<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Trait para padronizar respostas da API
 *
 * Formato padrão:
 * {
 *   "success": boolean,
 *   "message": string,
 *   "data": T | T[] | null,
 *   "meta"?: { current_page, last_page, per_page, total },
 *   "errors"?: { field: [string] }
 * }
 */
trait ApiResponses
{
    /**
     * Resposta de sucesso genérica
     */
    protected function successResponse(
        mixed $data = null,
        string $message = 'Operação realizada com sucesso.',
        int $statusCode = 200
    ): JsonResponse {
        $response = [
            'success' => true,
            'message' => $message,
            'data' => $data,
        ];

        return response()->json($response, $statusCode);
    }

    /**
     * Resposta de sucesso com dados paginados
     */
    protected function successPaginatedResponse(
        LengthAwarePaginator $paginator,
        string $message = 'Lista recuperada com sucesso.'
    ): JsonResponse {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    /**
     * Resposta de sucesso para criação de recurso
     */
    protected function createdResponse(
        mixed $data,
        string $message = 'Recurso criado com sucesso.'
    ): JsonResponse {
        return $this->successResponse($data, $message, 201);
    }

    /**
     * Resposta de sucesso para atualização de recurso
     */
    protected function updatedResponse(
        mixed $data = null,
        string $message = 'Recurso atualizado com sucesso.'
    ): JsonResponse {
        return $this->successResponse($data, $message, 200);
    }

    /**
     * Resposta de sucesso para exclusão de recurso
     */
    protected function deletedResponse(
        string $message = 'Recurso excluído com sucesso.'
    ): JsonResponse {
        return $this->successResponse(null, $message, 200);
    }

    /**
     * Resposta de erro genérica
     */
    protected function errorResponse(
        string $message = 'Ocorreu um erro.',
        int $statusCode = 400,
        ?array $errors = null
    ): JsonResponse {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Resposta de erro de validação (422)
     */
    protected function validationErrorResponse(
        array $errors,
        string $message = 'Erro de validação.'
    ): JsonResponse {
        return $this->errorResponse($message, 422, $errors);
    }

    /**
     * Resposta de erro não encontrado (404)
     */
    protected function notFoundResponse(
        string $message = 'Recurso não encontrado.'
    ): JsonResponse {
        return $this->errorResponse($message, 404);
    }

    /**
     * Resposta de erro não autorizado (401)
     */
    protected function unauthorizedResponse(
        string $message = 'Não autorizado.'
    ): JsonResponse {
        return $this->errorResponse($message, 401);
    }

    /**
     * Resposta de erro proibido (403)
     */
    protected function forbiddenResponse(
        string $message = 'Acesso negado.'
    ): JsonResponse {
        return $this->errorResponse($message, 403);
    }

    /**
     * Resposta de erro de servidor (500)
     */
    protected function serverErrorResponse(
        string $message = 'Erro interno do servidor.'
    ): JsonResponse {
        return $this->errorResponse($message, 500);
    }

    /**
     * Resposta de erro de conflito (409)
     */
    protected function conflictResponse(
        string $message = 'Conflito de dados.'
    ): JsonResponse {
        return $this->errorResponse($message, 409);
    }

    /**
     * Resposta sem conteúdo (204)
     */
    protected function noContentResponse(): JsonResponse
    {
        return response()->json(null, 204);
    }
}
