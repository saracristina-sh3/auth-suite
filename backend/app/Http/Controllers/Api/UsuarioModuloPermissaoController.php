<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UsuarioModuloPermissao;
use App\Models\User;
use App\Models\Modulo;
use App\Services\PermissionService;
use App\Services\AutarquiaSessionService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;

class UsuarioModuloPermissaoController extends Controller
{
    public function __construct(
        private PermissionService $permissionService,
        private AutarquiaSessionService $autarquiaSessionService
    ) {}

    /**
     * Lista todas as permissões
     */
    public function index(Request $request): JsonResponse
    {
        $query = UsuarioModuloPermissao::with(['user:id,name,email', 'modulo:id,nome,icone', 'autarquia:id,nome']);

        // Aplicar filtros usando scopes
        if ($request->has('user_id')) {
            $query->doUsuario($request->get('user_id'));
        }

        if ($request->has('modulo_id')) {
            $query->doModulo($request->get('modulo_id'));
        }

        if ($request->has('autarquia_ativa_id')) {
            $query->daAutarquia($request->get('autarquia_ativa_id'));
        }

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
        $permissao = UsuarioModuloPermissao::filtroCompleto($userId, $moduloId, $autarquiaId)
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
            'autarquia_ativa_id' => 'required|exists:autarquias,id',
            'permissao_leitura' => 'boolean',
            'permissao_escrita' => 'boolean',
            'permissao_exclusao' => 'boolean',
            'permissao_admin' => 'boolean',
            'ativo' => 'boolean',
        ]);

        $this->validarPermissao($validated);

        if ($this->permissaoExiste($validated['user_id'], $validated['modulo_id'], $validated['autarquia_ativa_id'])) {
            return response()->json([
                'success' => false,
                'message' => 'Esta permissão já existe para este usuário.',
            ], 422);
        }

        $permissao = $this->criarPermissao($validated);
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

        $permissao = UsuarioModuloPermissao::filtroCompleto($userId, $moduloId, $autarquiaId)
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
        $permissao = UsuarioModuloPermissao::filtroCompleto($userId, $moduloId, $autarquiaId)
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
            'autarquia_ativa_id' => 'required|exists:autarquias,id',
            'modulos' => 'required|array',
            'modulos.*.modulo_id' => 'required|exists:modulos,id',
            'modulos.*.permissao_leitura' => 'boolean',
            'modulos.*.permissao_escrita' => 'boolean',
            'modulos.*.permissao_exclusao' => 'boolean',
            'modulos.*.permissao_admin' => 'boolean',
        ]);

        $userId = $validated['user_id'];
        $autarquiaId = $validated['autarquia_ativa_id'];

        $this->validarUsuarioAutarquia($userId, $autarquiaId);

        $resultado = $this->processarPermissoesEmLote($userId, $autarquiaId, $validated['modulos']);

        return response()->json([
            'success' => true,
            'message' => 'Permissões processadas com sucesso.',
            'data' => $resultado,
        ], 201);
    }

    /**
     * Retorna as permissões de um usuário em um módulo específico
     */
    public function checkPermission(int $userId, int $moduloId): JsonResponse
    {
        $user = User::findOrFail($userId);
        $autarquiaId = $user->autarquia_ativa_id;

        $permissao = UsuarioModuloPermissao::filtroCompleto($userId, $moduloId, $autarquiaId)
            ->ativas()
            ->first();

        if (!$permissao) {
            return response()->json([
                'success' => false,
                'message' => 'Usuário não possui permissão para este módulo.',
                'data' => $this->formatarPermissaoVazia(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Permissões do usuário recuperadas com sucesso.',
            'data' => $this->formatarPermissao($permissao),
        ]);
    }

    /**
     * Métodos privados para extrair lógica complexa
     */
    private function validarPermissao(array $dados): void
    {
        $this->validarUsuarioAutarquia($dados['user_id'], $dados['autarquia_ativa_id']);
        $this->validarModuloAutarquia($dados['autarquia_ativa_id'], $dados['modulo_id']);
    }

    private function validarUsuarioAutarquia(int $userId, int $autarquiaId): void
    {
        $user = User::find($userId);
        if ($user->autarquia_ativa_id != $autarquiaId) {
            throw ValidationException::withMessages([
                'autarquia_ativa_id' => ['O usuário não pertence a esta autarquia.']
            ]);
        }
    }

    private function validarModuloAutarquia(int $autarquiaId, int $moduloId): void
    {
        $moduloLiberado = DB::table('autarquia_modulo')
            ->where('autarquia_ativa_id', $autarquiaId)
            ->where('modulo_id', $moduloId)
            ->where('ativo', true)
            ->exists();

        if (!$moduloLiberado) {
            throw ValidationException::withMessages([
                'modulo_id' => ['O módulo não está liberado para esta autarquia.']
            ]);
        }
    }

    private function permissaoExiste(int $userId, int $moduloId, int $autarquiaId): bool
    {
        return UsuarioModuloPermissao::filtroCompleto($userId, $moduloId, $autarquiaId)
            ->exists();
    }

    private function criarPermissao(array $dados): UsuarioModuloPermissao
    {
        return UsuarioModuloPermissao::create([
            'user_id' => $dados['user_id'],
            'modulo_id' => $dados['modulo_id'],
            'autarquia_ativa_id' => $dados['autarquia_ativa_id'],
            'permissao_leitura' => $dados['permissao_leitura'] ?? false,
            'permissao_escrita' => $dados['permissao_escrita'] ?? false,
            'permissao_exclusao' => $dados['permissao_exclusao'] ?? false,
            'permissao_admin' => $dados['permissao_admin'] ?? false,
            'data_concessao' => now(),
            'ativo' => $dados['ativo'] ?? true,
        ]);
    }

    private function processarPermissoesEmLote(int $userId, int $autarquiaId, array $modulos): array
    {
        $permissoesCriadas = [];
        $erros = [];

        DB::beginTransaction();
        try {
            foreach ($modulos as $moduloData) {
                $moduloId = $moduloData['modulo_id'];

                try {
                    $this->validarModuloAutarquia($autarquiaId, $moduloId);

                    if ($this->permissaoExiste($userId, $moduloId, $autarquiaId)) {
                        $modulo = Modulo::find($moduloId);
                        $erros[] = "Permissão para módulo '{$modulo->nome}' já existe";
                        continue;
                    }

                    $permissao = $this->criarPermissao([
                        'user_id' => $userId,
                        'modulo_id' => $moduloId,
                        'autarquia_ativa_id' => $autarquiaId,
                        'permissao_leitura' => $moduloData['permissao_leitura'] ?? false,
                        'permissao_escrita' => $moduloData['permissao_escrita'] ?? false,
                        'permissao_exclusao' => $moduloData['permissao_exclusao'] ?? false,
                        'permissao_admin' => $moduloData['permissao_admin'] ?? false,
                        'ativo' => true,
                    ]);

                    $permissao->load(['modulo:id,nome,icone']);
                    $permissoesCriadas[] = $permissao;

                } catch (ValidationException $e) {
                    $modulo = Modulo::find($moduloId);
                    $erros[] = "Módulo '{$modulo->nome}' não liberado para autarquia";
                }
            }

            DB::commit();

            return [
                'permissoes' => $permissoesCriadas,
                'erros' => $erros,
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    private function formatarPermissao(UsuarioModuloPermissao $permissao): array
    {
        return [
            'tem_acesso' => true,
            'pode_ler' => $permissao->podeLer(),
            'pode_escrever' => $permissao->podeEscrever(),
            'pode_excluir' => $permissao->podeExcluir(),
            'e_admin' => $permissao->eAdmin(),
            'permissao' => $permissao,
        ];
    }

    private function formatarPermissaoVazia(): array
    {
        return [
            'tem_acesso' => false,
            'pode_ler' => false,
            'pode_escrever' => false,
            'pode_excluir' => false,
            'e_admin' => false,
        ];
    }
}
