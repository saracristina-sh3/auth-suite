<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UsuarioModuloPermissao;
use App\Models\User;
use App\Models\Modulo;
use App\Models\Autarquia;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UsuarioModuloPermissaoController extends Controller
{
    /**
     * Lista todas as permissões
     */
    public function index(Request $request): JsonResponse
    {
        $query = UsuarioModuloPermissao::query()
            ->with(['user:id,name,email', 'modulo:id,nome,icone', 'autarquia:id,nome']);

        // Filtrar por usuário
        if ($request->has('user_id')) {
            $query->where('user_id', $request->get('user_id'));
        }

        // Filtrar por módulo
        if ($request->has('modulo_id')) {
            $query->where('modulo_id', $request->get('modulo_id'));
        }

        // Filtrar por autarquia
        if ($request->has('autarquia_id')) {
            $query->where('autarquia_id', $request->get('autarquia_id'));
        }

        // Filtrar por status ativo
        if ($request->has('ativo')) {
            $query->where('ativo', $request->boolean('ativo'));
        }

        $permissoes = $query->orderBy('data_concessao', 'desc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Permissões recuperadas com sucesso.',
            'data' => $permissoes,
        ]);
    }

    /**
     * Exibe uma permissão específica
     */
    public function show(int $userId, int $moduloId, int $autarquiaId): JsonResponse
    {
        $permissao = UsuarioModuloPermissao::where('user_id', $userId)
            ->where('modulo_id', $moduloId)
            ->where('autarquia_id', $autarquiaId)
            ->with(['user:id,name,email', 'modulo:id,nome,icone', 'autarquia:id,nome'])
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'message' => 'Permissão recuperada com sucesso.',
            'data' => $permissao,
        ]);
    }

    /**
     * Cria uma nova permissão para usuário
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'modulo_id' => 'required|exists:modulos,id',
            'autarquia_id' => 'required|exists:autarquias,id',
            'permissao_leitura' => 'boolean',
            'permissao_escrita' => 'boolean',
            'permissao_exclusao' => 'boolean',
            'permissao_admin' => 'boolean',
            'ativo' => 'boolean',
        ]);

        // Verificar se o usuário pertence à autarquia
        $user = User::find($validated['user_id']);
        if ($user->autarquia_id != $validated['autarquia_id']) {
            throw ValidationException::withMessages([
                'autarquia_id' => ['O usuário não pertence a esta autarquia.']
            ]);
        }

        // Verificar se o módulo está liberado para a autarquia
        $moduloLiberado = DB::table('autarquia_modulo')
            ->where('autarquia_id', $validated['autarquia_id'])
            ->where('modulo_id', $validated['modulo_id'])
            ->where('ativo', true)
            ->exists();

        if (!$moduloLiberado) {
            throw ValidationException::withMessages([
                'modulo_id' => ['O módulo não está liberado para esta autarquia.']
            ]);
        }

        // Verificar se a permissão já existe
        $existe = UsuarioModuloPermissao::where('user_id', $validated['user_id'])
            ->where('modulo_id', $validated['modulo_id'])
            ->where('autarquia_id', $validated['autarquia_id'])
            ->first();

        if ($existe) {
            return response()->json([
                'success' => false,
                'message' => 'Esta permissão já existe para este usuário.',
            ], 422);
        }

        $permissao = UsuarioModuloPermissao::create([
            'user_id' => $validated['user_id'],
            'modulo_id' => $validated['modulo_id'],
            'autarquia_id' => $validated['autarquia_id'],
            'permissao_leitura' => $validated['permissao_leitura'] ?? false,
            'permissao_escrita' => $validated['permissao_escrita'] ?? false,
            'permissao_exclusao' => $validated['permissao_exclusao'] ?? false,
            'permissao_admin' => $validated['permissao_admin'] ?? false,
            'data_concessao' => now(),
            'ativo' => $validated['ativo'] ?? true,
        ]);

        $permissao->load(['user:id,name,email', 'modulo:id,nome,icone', 'autarquia:id,nome']);

        return response()->json([
            'success' => true,
            'message' => 'Permissão criada com sucesso.',
            'data' => $permissao,
        ], 201);
    }

    /**
     * Atualiza uma permissão existente
     */
    public function update(Request $request, int $userId, int $moduloId, int $autarquiaId): JsonResponse
    {
        $validated = $request->validate([
            'permissao_leitura' => 'sometimes|boolean',
            'permissao_escrita' => 'sometimes|boolean',
            'permissao_exclusao' => 'sometimes|boolean',
            'permissao_admin' => 'sometimes|boolean',
            'ativo' => 'sometimes|boolean',
        ]);

        $permissao = UsuarioModuloPermissao::where('user_id', $userId)
            ->where('modulo_id', $moduloId)
            ->where('autarquia_id', $autarquiaId)
            ->firstOrFail();

        $permissao->update($validated);
        $permissao->load(['user:id,name,email', 'modulo:id,nome,icone', 'autarquia:id,nome']);

        return response()->json([
            'success' => true,
            'message' => 'Permissão atualizada com sucesso.',
            'data' => $permissao,
        ]);
    }

    /**
     * Remove uma permissão
     */
    public function destroy(int $userId, int $moduloId, int $autarquiaId): JsonResponse
    {
        $permissao = UsuarioModuloPermissao::where('user_id', $userId)
            ->where('modulo_id', $moduloId)
            ->where('autarquia_id', $autarquiaId)
            ->firstOrFail();

        $permissao->delete();

        return response()->json([
            'success' => true,
            'message' => 'Permissão removida com sucesso.',
        ]);
    }

    /**
     * Atribui múltiplos módulos para um usuário
     */
    public function bulkStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'autarquia_id' => 'required|exists:autarquias,id',
            'modulos' => 'required|array',
            'modulos.*.modulo_id' => 'required|exists:modulos,id',
            'modulos.*.permissao_leitura' => 'boolean',
            'modulos.*.permissao_escrita' => 'boolean',
            'modulos.*.permissao_exclusao' => 'boolean',
            'modulos.*.permissao_admin' => 'boolean',
        ]);

        $userId = $validated['user_id'];
        $autarquiaId = $validated['autarquia_id'];

        // Verificar se o usuário pertence à autarquia
        $user = User::find($userId);
        if ($user->autarquia_id != $autarquiaId) {
            throw ValidationException::withMessages([
                'autarquia_id' => ['O usuário não pertence a esta autarquia.']
            ]);
        }

        $permissoesCriadas = [];
        $erros = [];

        DB::beginTransaction();
        try {
            foreach ($validated['modulos'] as $moduloData) {
                $moduloId = $moduloData['modulo_id'];

                // Verificar se o módulo está liberado para a autarquia
                $moduloLiberado = DB::table('autarquia_modulo')
                    ->where('autarquia_id', $autarquiaId)
                    ->where('modulo_id', $moduloId)
                    ->where('ativo', true)
                    ->exists();

                if (!$moduloLiberado) {
                    $modulo = Modulo::find($moduloId);
                    $erros[] = "Módulo '{$modulo->nome}' não liberado para autarquia";
                    continue;
                }

                // Verificar se já existe
                $existe = UsuarioModuloPermissao::where('user_id', $userId)
                    ->where('modulo_id', $moduloId)
                    ->where('autarquia_id', $autarquiaId)
                    ->first();

                if ($existe) {
                    $modulo = Modulo::find($moduloId);
                    $erros[] = "Permissão para módulo '{$modulo->nome}' já existe";
                    continue;
                }

                $permissao = UsuarioModuloPermissao::create([
                    'user_id' => $userId,
                    'modulo_id' => $moduloId,
                    'autarquia_id' => $autarquiaId,
                    'permissao_leitura' => $moduloData['permissao_leitura'] ?? false,
                    'permissao_escrita' => $moduloData['permissao_escrita'] ?? false,
                    'permissao_exclusao' => $moduloData['permissao_exclusao'] ?? false,
                    'permissao_admin' => $moduloData['permissao_admin'] ?? false,
                    'data_concessao' => now(),
                    'ativo' => true,
                ]);

                $permissao->load(['modulo:id,nome,icone']);
                $permissoesCriadas[] = $permissao;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Permissões criadas com sucesso.',
                'data' => [
                    'permissoes' => $permissoesCriadas,
                    'erros' => $erros,
                ],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erro ao criar permissões: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Retorna as permissões de um usuário em um módulo específico
     */
    public function checkPermission(int $userId, int $moduloId): JsonResponse
    {
        $user = User::findOrFail($userId);
        $modulo = Modulo::findOrFail($moduloId);

        $permissao = UsuarioModuloPermissao::where('user_id', $userId)
            ->where('modulo_id', $moduloId)
            ->where('autarquia_id', $user->autarquia_id)
            ->where('ativo', true)
            ->first();

        if (!$permissao) {
            return response()->json([
                'success' => false,
                'message' => 'Usuário não possui permissão para este módulo.',
                'data' => [
                    'tem_acesso' => false,
                    'pode_ler' => false,
                    'pode_escrever' => false,
                    'pode_excluir' => false,
                    'e_admin' => false,
                ],
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Permissões do usuário recuperadas com sucesso.',
            'data' => [
                'tem_acesso' => true,
                'pode_ler' => $permissao->permissao_leitura,
                'pode_escrever' => $permissao->permissao_escrita,
                'pode_excluir' => $permissao->permissao_exclusao,
                'e_admin' => $permissao->permissao_admin,
                'permissao' => $permissao,
            ],
        ]);
    }
}
