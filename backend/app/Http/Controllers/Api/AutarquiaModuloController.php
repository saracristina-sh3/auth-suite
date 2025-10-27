<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AutarquiaModulo;
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
     * Atualiza o status de liberação de um módulo para uma autarquia
     */
    public function update(Request $request, int $autarquiaId, int $moduloId): JsonResponse
    {
        $validated = $request->validate([
            'ativo' => 'required|boolean',
        ]);

        // Criar ou atualizar o registro
        $liberacao = AutarquiaModulo::updateOrCreate(
            [
                'autarquia_id' => $autarquiaId,
                'modulo_id' => $moduloId,
            ],
            [
                'ativo' => $validated['ativo'],
                'data_liberacao' => now(),
            ]
        );

        $liberacao->load(['autarquia:id,nome', 'modulo:id,nome,icone']);

        return response()->json([
            'success' => true,
            'message' => 'Status de liberação atualizado com sucesso.',
            'data' => $liberacao,
        ]);
    }

    /**
     * Atualiza o status de múltiplos módulos para uma autarquia
     */
public function bulkUpdate(Request $request): JsonResponse
{
    $validated = $request->validate([
        'autarquia_id' => 'required|exists:autarquias,id',
        'modulos' => 'required|array',
        'modulos.*.modulo_id' => 'required',
        'modulos.*.ativo' => 'required|boolean',
    ]);

    $autarquiaId = (int) $validated['autarquia_id'];
    $modulos = $validated['modulos'];

    $atualizados = [];
    $erros = [];

    \Log::info('📦 Payload recebido no bulkUpdate', $request->all());

    DB::beginTransaction();
    try {
        foreach ($modulos as $index => $moduloData) {
            try {
                // 🔍 Garantir formato válido
                if (!is_array($moduloData)) {
                    throw new \Exception("O módulo no índice {$index} não é um array válido");
                }

                // Forçar tipos
                $moduloId = isset($moduloData['modulo_id'])
                    ? (int) (is_array($moduloData['modulo_id']) ? ($moduloData['modulo_id'][0] ?? 0) : $moduloData['modulo_id'])
                    : 0;

                $ativo = (bool) ($moduloData['ativo'] ?? false);

                if (!$moduloId) {
                    throw new \Exception("modulo_id ausente ou inválido no índice {$index}");
                }

                // ✅ Criar ou atualizar
                $liberacao = AutarquiaModulo::updateOrCreate(
                    [
                        'autarquia_id' => $autarquiaId,
                        'modulo_id' => $moduloId,
                    ],
                    [
                        'ativo' => $ativo,
                        'data_liberacao' => now(),
                    ]
                );

                $liberacao->loadMissing(['modulo:id,nome,icone']);
                $atualizados[] = $liberacao;

                \Log::info('✅ Módulo atualizado', [
                    'autarquia_id' => $autarquiaId,
                    'modulo_id' => $moduloId,
                    'ativo' => $ativo,
                ]);
            } catch (\Throwable $e) {
                \Log::error('❌ Erro ao processar módulo', [
                    'index' => $index,
                    'dados' => $moduloData,
                    'erro' => $e->getMessage(),
                ]);
                $erros[] = [
                    'index' => $index,
                    'modulo_id' => $moduloData['modulo_id'] ?? null,
                    'erro' => $e->getMessage(),
                ];
            }
        }

        DB::commit();

        $status = count($erros) ? 207 : 200;

        return response()->json([
            'success' => count($erros) === 0,
            'message' => count($erros)
                ? 'Alguns módulos não puderam ser atualizados.'
                : 'Módulos atualizados com sucesso.',
            'data' => [
                'atualizados' => $atualizados,
                'erros' => $erros,
            ],
        ], $status);
    } catch (\Throwable $e) {
        DB::rollBack();

        \Log::critical('🔥 Erro fatal em bulkUpdate', [
            'autarquia_id' => $autarquiaId,
            'erro' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);

        return response()->json([
            'success' => false,
            'message' => 'Erro interno ao atualizar liberações: ' . $e->getMessage(),
        ], 500);
    }
}



}
