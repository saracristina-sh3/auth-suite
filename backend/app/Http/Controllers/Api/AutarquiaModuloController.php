<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Autarquia;
use App\Models\AutarquiaModulo;
use App\Models\Modulo;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AutarquiaModuloController extends Controller
{
    /**
     * Lista todas as liberações de módulos para autarquias
     */
    public function index(Request $request): JsonResponse
    {
        $query = AutarquiaModulo::query()
            ->with(['autarquia:id,nome', 'modulo:id,nome,icone']);

        // Filtrar por autarquia
        if ($request->has('autarquia_id')) {
            $query->where('autarquia_id', $request->get('autarquia_id'));
        }

        // Filtrar por módulo
        if ($request->has('modulo_id')) {
            $query->where('modulo_id', $request->get('modulo_id'));
        }

        // Filtrar por status ativo
        if ($request->has('ativo')) {
            $query->where('ativo', $request->boolean('ativo'));
        }

        $liberacoes = $query->orderBy('data_liberacao', 'desc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Liberações recuperadas com sucesso.',
            'data' => $liberacoes,
        ]);
    }

    /**
     * Libera um módulo para uma autarquia
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'autarquia_id' => 'required|exists:autarquias,id',
            'modulo_id' => 'required|exists:modulos,id',
            'data_liberacao' => 'nullable|date',
            'ativo' => 'boolean',
        ]);

        // Verificar se já existe a liberação
        $existe = AutarquiaModulo::where('autarquia_id', $validated['autarquia_id'])
            ->where('modulo_id', $validated['modulo_id'])
            ->first();

        if ($existe) {
            return response()->json([
                'success' => false,
                'message' => 'Este módulo já está liberado para esta autarquia.',
            ], 422);
        }

        $liberacao = AutarquiaModulo::create([
            'autarquia_id' => $validated['autarquia_id'],
            'modulo_id' => $validated['modulo_id'],
            'data_liberacao' => $validated['data_liberacao'] ?? now(),
            'ativo' => $validated['ativo'] ?? true,
        ]);

        $liberacao->load(['autarquia:id,nome', 'modulo:id,nome,icone']);

        return response()->json([
            'success' => true,
            'message' => 'Módulo liberado para autarquia com sucesso.',
            'data' => $liberacao,
        ], 201);
    }

    /**
     * Atualiza a liberação de um módulo para uma autarquia
     */
    public function update(Request $request, int $autarquiaId, int $moduloId): JsonResponse
    {
        $validated = $request->validate([
            'ativo' => 'sometimes|boolean',
            'data_liberacao' => 'sometimes|date',
        ]);

        $liberacao = AutarquiaModulo::where('autarquia_id', $autarquiaId)
            ->where('modulo_id', $moduloId)
            ->firstOrFail();

        $liberacao->update($validated);
        $liberacao->load(['autarquia:id,nome', 'modulo:id,nome,icone']);

        return response()->json([
            'success' => true,
            'message' => 'Liberação atualizada com sucesso.',
            'data' => $liberacao,
        ]);
    }

    /**
     * Remove a liberação de um módulo para uma autarquia
     */
    public function destroy(int $autarquiaId, int $moduloId): JsonResponse
    {
        $liberacao = AutarquiaModulo::where('autarquia_id', $autarquiaId)
            ->where('modulo_id', $moduloId)
            ->firstOrFail();

        // Verificar se existem permissões de usuários vinculadas
        $temPermissoes = DB::table('usuario_modulo_permissao')
            ->where('autarquia_id', $autarquiaId)
            ->where('modulo_id', $moduloId)
            ->exists();

        if ($temPermissoes) {
            return response()->json([
                'success' => false,
                'message' => 'Não é possível remover a liberação pois existem permissões de usuários vinculadas.',
            ], 422);
        }

        $liberacao->delete();

        return response()->json([
            'success' => true,
            'message' => 'Liberação removida com sucesso.',
        ]);
    }

    /**
     * Libera múltiplos módulos para uma autarquia
     */
    public function bulkStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'autarquia_id' => 'required|exists:autarquias,id',
            'modulo_ids' => 'required|array',
            'modulo_ids.*' => 'required|exists:modulos,id',
        ]);

        $autarquiaId = $validated['autarquia_id'];
        $moduloIds = $validated['modulo_ids'];

        $liberados = [];
        $erros = [];

        DB::beginTransaction();
        try {
            foreach ($moduloIds as $moduloId) {
                // Verificar se já existe
                $existe = AutarquiaModulo::where('autarquia_id', $autarquiaId)
                    ->where('modulo_id', $moduloId)
                    ->first();

                if ($existe) {
                    $modulo = Modulo::find($moduloId);
                    $erros[] = "Módulo '{$modulo->nome}' já liberado";
                    continue;
                }

                $liberacao = AutarquiaModulo::create([
                    'autarquia_id' => $autarquiaId,
                    'modulo_id' => $moduloId,
                    'data_liberacao' => now(),
                    'ativo' => true,
                ]);

                $liberacao->load(['modulo:id,nome,icone']);
                $liberados[] = $liberacao;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Módulos liberados com sucesso.',
                'data' => [
                    'liberados' => $liberados,
                    'erros' => $erros,
                ],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erro ao liberar módulos: ' . $e->getMessage(),
            ], 500);
        }
    }
}
