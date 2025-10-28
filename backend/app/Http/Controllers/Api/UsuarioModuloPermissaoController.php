<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PermissionService;
use App\Repositories\PermissionRepository;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use App\Traits\ApiResponses;

class UsuarioModuloPermissaoController extends Controller
{
    use ApiResponses;

    public function __construct(
        private PermissionService $permissionService,
        private PermissionRepository $permissaoRepository
    ) {}

    /**
     * Lista todas as permissões
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $permissoes = $this->permissaoRepository->getPermissoesComFiltros($request->all());
            return $this->successResponse($permissoes, 'Permissões recuperadas com sucesso.');
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Erro ao recuperar permissões: ' . $e->getMessage());
        }
    }

    /**
     * Exibe uma permissão específica
     */
    public function show(int $userId, int $moduloId, int $autarquiaId): JsonResponse
    {
        try {
            $permissao = $this->permissaoRepository->findPermissaoOrFail($userId, $moduloId, $autarquiaId);
            return $this->successResponse($permissao, 'Permissão recuperada com sucesso.');
        } catch (\Exception $e) {
            return $this->notFoundResponse('Permissão não encontrada.');
        }
    }

    /**
     * Cria uma nova permissão
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $this->validateStoreRequest($request);
            $permissao = $this->permissionService->concederPermissao(
                $validated['user_id'],
                $validated['modulo_id'],
                $validated['autarquia_ativa_id'],
                $this->formatarPermissoes($validated)
            );
            return $this->createdResponse($permissao, 'Permissão criada com sucesso.');
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->handleServiceException($e, 'criar permissão');
        }
    }

    /**
     * Atualiza uma permissão existente
     */
    public function update(Request $request, int $userId, int $moduloId, int $autarquiaId): JsonResponse
    {
        try {
            $validated = $this->validateUpdateRequest($request);
            $permissao = $this->permissaoRepository->findPermissaoOrFail($userId, $moduloId, $autarquiaId);
            $permissao->update($validated);
            $permissao->load(['user:id,name,email', 'modulo:id,nome,icone', 'autarquia:id,nome']);
            return $this->updatedResponse($permissao, 'Permissão atualizada com sucesso.');
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->handleServiceException($e, 'atualizar permissão');
        }
    }

    /**
     * Remove uma permissão
     */
    public function destroy(int $userId, int $moduloId, int $autarquiaId): JsonResponse
    {
        try {
            $permissao = $this->permissaoRepository->findPermissaoOrFail($userId, $moduloId, $autarquiaId);
            $permissao->delete();
            return $this->deletedResponse('Permissão removida com sucesso.');
        } catch (\Exception $e) {
            return $this->handleServiceException($e, 'remover permissão');
        }
    }

    /**
     * Atribui múltiplos módulos
     */
    public function bulkStore(Request $request): JsonResponse
    {
        try {
            $validated = $this->validateBulkStoreRequest($request);

            $permissoesModulos = [];
            foreach ($validated['modulos'] as $moduloData) {
                $permissoesModulos[$moduloData['modulo_id']] = [
                    'permissao_leitura' => $moduloData['permissao_leitura'] ?? false,
                    'permissao_escrita' => $moduloData['permissao_escrita'] ?? false,
                    'permissao_exclusao' => $moduloData['permissao_exclusao'] ?? false,
                    'permissao_admin' => $moduloData['permissao_admin'] ?? false,
                ];
            }

            $sucesso = $this->permissionService->sincronizarPermissoes(
                $validated['user_id'],
                $validated['autarquia_ativa_id'],
                $permissoesModulos
            );

            if ($sucesso) {
                return $this->createdResponse(null, 'Permissões criadas com sucesso.');
            }

            return $this->errorResponse('Erro ao criar permissões em lote.');
        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->handleServiceException($e, 'criar permissões em lote');
        }
    }

    /**
     * Verifica permissão
     */
    public function checkPermission(int $userId, int $moduloId): JsonResponse
    {
        try {
            $permissoes = $this->permissionService->verificarPermissaoUsuario($userId, $moduloId);
            $mensagem = $permissoes['tem_acesso']
                ? 'Permissões recuperadas com sucesso.'
                : 'Usuário não possui permissão para este módulo.';
            return $this->successResponse($permissoes, $mensagem);
        } catch (\Exception $e) {
            return $this->handleServiceException($e, 'verificar permissão');
        }
    }

    /**
     * Obtém permissões formatadas
     */
    public function getPermissoesFormatadas(int $userId, int $autarquiaId): JsonResponse
    {
        try {
            $permissoes = $this->permissionService->getPermissoesFormatadas($userId, $autarquiaId);
            return $this->successResponse($permissoes, 'Permissões formatadas recuperadas com sucesso.');
        } catch (\Exception $e) {
            return $this->handleServiceException($e, 'recuperar permissões formatadas');
        }
    }

    /**
     * Métodos auxiliares privados
     */
    private function validateStoreRequest(Request $request): array
    {
        return $request->validate([
            'user_id' => 'required|exists:users,id',
            'modulo_id' => 'required|exists:modulos,id',
            'autarquia_ativa_id' => 'required|exists:autarquias,id',
            'permissao_leitura' => 'boolean',
            'permissao_escrita' => 'boolean',
            'permissao_exclusao' => 'boolean',
            'permissao_admin' => 'boolean',
            'ativo' => 'boolean',
        ]);
    }

    private function validateUpdateRequest(Request $request): array
    {
        return $request->validate([
            'permissao_leitura' => 'sometimes|boolean',
            'permissao_escrita' => 'sometimes|boolean',
            'permissao_exclusao' => 'sometimes|boolean',
            'permissao_admin' => 'sometimes|boolean',
            'ativo' => 'sometimes|boolean',
        ]);
    }

    private function validateBulkStoreRequest(Request $request): array
    {
        return $request->validate([
            'user_id' => 'required|exists:users,id',
            'autarquia_ativa_id' => 'required|exists:autarquias,id',
            'modulos' => 'required|array',
            'modulos.*.modulo_id' => 'required|exists:modulos,id',
            'modulos.*.permissao_leitura' => 'boolean',
            'modulos.*.permissao_escrita' => 'boolean',
            'modulos.*.permissao_exclusao' => 'boolean',
            'modulos.*.permissao_admin' => 'boolean',
        ]);
    }

    private function formatarPermissoes(array $dados): array
    {
        return [
            'permissao_leitura' => $dados['permissao_leitura'] ?? false,
            'permissao_escrita' => $dados['permissao_escrita'] ?? false,
            'permissao_exclusao' => $dados['permissao_exclusao'] ?? false,
            'permissao_admin' => $dados['permissao_admin'] ?? false,
            'ativo' => $dados['ativo'] ?? true,
        ];
    }

    private function handleServiceException(\Exception $e, string $operacao): JsonResponse
    {
        $statusCode = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;

        if ($statusCode === 409) {
            return $this->conflictResponse($e->getMessage());
        }

        return $this->errorResponse(
            "Erro ao {$operacao}: " . $e->getMessage(),
            $statusCode
        );
    }
}
