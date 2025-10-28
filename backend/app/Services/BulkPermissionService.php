<?php

namespace App\Services;

use App\Models\User;
use App\Models\Modulo;
use App\Repositories\PermissionRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BulkPermissionService
{
    public function __construct(
        private PermissionValidationService $validationService,
        private PermissionRepository $permissaoRepository
    ) {}

    public function execute(int $userId, int $autarquiaId, array $modulos): array
    {
        $this->validationService->validarDadosPermissaoLote([
            'user_id' => $userId,
            'autarquia_ativa_id' => $autarquiaId
        ]);

        $permissoesCriadas = [];
        $erros = [];

        DB::beginTransaction();

        foreach ($modulos as $moduloData) {
            $moduloId = $moduloData['modulo_id'];

            try {
                $this->validationService->validarModuloAutarquia($autarquiaId, $moduloId);

                if ($this->permissaoRepository->permissaoExiste($userId, $moduloId, $autarquiaId)) {
                    $modulo = Modulo::find($moduloId);
                    $erros[] = "Permissão para módulo '{$modulo->nome}' já existe";
                    continue;
                }

                $permissao = $this->permissaoRepository->criarPermissao([
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
    }
}
