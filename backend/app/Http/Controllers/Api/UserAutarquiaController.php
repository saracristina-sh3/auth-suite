<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Autarquia;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class UserAutarquiaController extends Controller
{
    /**
     * Lista as autarquias vinculadas a um usuário específico.
     */
    public function index(User $user): JsonResponse
    {
        try {
            // ✅ Eager loading já está otimizado - apenas selecionando campos necessários
            $autarquias = $user->autarquias()
                ->select('autarquias.id', 'autarquias.nome', 'autarquias.ativo')
                ->withPivot('role', 'is_admin', 'is_default', 'ativo', 'data_vinculo')
                ->orderBy('autarquias.nome')
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Autarquias do usuário recuperadas com sucesso.',
                'data' => $autarquias,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao recuperar autarquias do usuário.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Anexa uma ou mais autarquias a um usuário.
     */
    public function attach(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'autarquia_ids' => 'required|array',
            'autarquia_ids.*' => 'exists:autarquias,id',
            'pivot_data' => 'sometimes|array',
            'pivot_data.role' => 'sometimes|string',
            'pivot_data.is_admin' => 'sometimes|boolean',
            'pivot_data.is_default' => 'sometimes|boolean',
            'pivot_data.ativo' => 'sometimes|boolean',
        ]);

        try {
            $autarquiaIds = $validated['autarquia_ids'];
            $pivotData = $validated['pivot_data'] ?? [];

            foreach ($autarquiaIds as $autarquiaId) {
                $user->autarquias()->attach($autarquiaId, array_merge([
                    'role' => 'user',
                    'is_admin' => false,
                    'is_default' => false,
                    'ativo' => true,
                    'data_vinculo' => now(),
                ], $pivotData));
            }

            return response()->json([
                'success' => true,
                'message' => 'Autarquias anexadas com sucesso.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao anexar autarquias.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Desanexa uma ou mais autarquias de um usuário.
     */
    public function detach(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'autarquia_ids' => 'required|array',
            'autarquia_ids.*' => 'exists:autarquias,id',
        ]);

        try {
            $user->autarquias()->detach($validated['autarquia_ids']);

            return response()->json([
                'success' => true,
                'message' => 'Autarquias desanexadas com sucesso.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao desanexar autarquias.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Sincroniza as autarquias de um usuário.
     */
    public function sync(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'autarquias' => 'required|array',
            'autarquias.*.id' => 'required|exists:autarquias,id',
            'autarquias.*.pivot_data' => 'sometimes|array',
            'autarquias.*.pivot_data.role' => 'sometimes|string',
            'autarquias.*.pivot_data.is_admin' => 'sometimes|boolean',
            'autarquias.*.pivot_data.is_default' => 'sometimes|boolean',
            'autarquias.*.pivot_data.ativo' => 'sometimes|boolean',
        ]);

        try {
            $syncData = [];
            foreach ($validated['autarquias'] as $autarquiaEntry) {
                $autarquiaId = $autarquiaEntry['id'];
                $pivotData = $autarquiaEntry['pivot_data'] ?? [];
                $syncData[$autarquiaId] = array_merge([
                    'role' => 'user',
                    'is_admin' => false,
                    'is_default' => false,
                    'ativo' => true,
                    'data_vinculo' => now(),
                ], $pivotData);
            }

            $user->autarquias()->sync($syncData);

            return response()->json([
                'success' => true,
                'message' => 'Autarquias sincronizadas com sucesso.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao sincronizar autarquias.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Atualiza a autarquia ativa de um usuário.
     */
    public function updateActive(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'autarquia_ativa_id' => 'required|exists:autarquias,id',
        ]);

        try {
            // Verifica se o usuário está realmente associado à autarquia que está sendo definida como ativa
            if (!$user->autarquias()->where('autarquia_id', $validated['autarquia_ativa_id'])->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'O usuário não está associado à autarquia fornecida.',
                ], 403);
            }

            $user->autarquia_ativa_id = $validated['autarquia_ativa_id'];
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Autarquia ativa do usuário atualizada com sucesso.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar autarquia ativa do usuário.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
