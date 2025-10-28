<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\UserAutarquiaManagementService;
use App\Rules\UserAutarquiaValidator;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class UserAutarquiaController extends Controller
{
    public function __construct(
        private UserAutarquiaManagementService $autarquiaService,
        private UserAutarquiaValidator $validator
    ) {}

    /**
     * Lista as autarquias vinculadas a um usuário específico.
     */
    public function index(User $user): JsonResponse
    {
        try {
            $autarquias = $this->autarquiaService->getUserAutarquias($user);

            return response()->json([
                'success' => true,
                'message' => 'Autarquias do usuário recuperadas com sucesso.',
                'data' => $autarquias,
            ]);
        } catch (\Exception $e) {
            return $this->handleError('Erro ao recuperar autarquias do usuário.', $e);
        }
    }

    /**
     * Anexa uma ou mais autarquias a um usuário.
     */
    public function attach(Request $request, User $user): JsonResponse
    {
        try {
            $validated = $this->validator->validateAttach($request->all());

            $this->autarquiaService->attachAutarquias(
                $user,
                $validated['autarquia_ids'],
                $validated['pivot_data'] ?? []
            );

            return response()->json([
                'success' => true,
                'message' => 'Autarquias anexadas com sucesso.',
            ]);
        } catch (\Exception $e) {
            return $this->handleError('Erro ao anexar autarquias.', $e);
        }
    }

    /**
     * Desanexa uma ou mais autarquias de um usuário.
     */
    public function detach(Request $request, User $user): JsonResponse
    {
        try {
            $validated = $this->validator->validateDetach($request->all());

            $this->autarquiaService->detachAutarquias($user, $validated['autarquia_ids']);

            return response()->json([
                'success' => true,
                'message' => 'Autarquias desanexadas com sucesso.',
            ]);
        } catch (\Exception $e) {
            return $this->handleError('Erro ao desanexar autarquias.', $e);
        }
    }

    /**
     * Sincroniza as autarquias de um usuário.
     */
    public function sync(Request $request, User $user): JsonResponse
    {
        try {
            $validated = $this->validator->validateSync($request->all());

            $this->autarquiaService->syncAutarquias($user, $validated['autarquias']);

            return response()->json([
                'success' => true,
                'message' => 'Autarquias sincronizadas com sucesso.',
            ]);
        } catch (\Exception $e) {
            return $this->handleError('Erro ao sincronizar autarquias.', $e);
        }
    }

    /**
     * Atualiza a autarquia ativa de um usuário.
     */
    public function updateActive(Request $request, User $user): JsonResponse
    {
        try {
            $validated = $this->validator->validateUpdateActive($request->all());

            $this->autarquiaService->updateActiveAutarquia($user, $validated['autarquia_ativa_id']);

            return response()->json([
                'success' => true,
                'message' => 'Autarquia ativa do usuário atualizada com sucesso.',
            ]);
        } catch (\Exception $e) {
            return $this->handleError('Erro ao atualizar autarquia ativa do usuário.', $e);
        }
    }

    /**
     * Manipula erros de forma consistente
     */
    private function handleError(string $message, \Exception $e): JsonResponse
    {
        $statusCode = $e instanceof \Illuminate\Validation\ValidationException ? 422 : 500;

        return response()->json([
            'success' => false,
            'message' => $message,
            'error' => config('app.debug') ? $e->getMessage() : null,
        ], $statusCode);
    }
}
