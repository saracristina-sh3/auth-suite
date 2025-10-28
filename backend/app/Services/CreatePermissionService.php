<?php

namespace App\Services;

use App\Repositories\PermissionRepository;

class CreatePermissionService
{
    public function __construct(
        private PermissionValidationService $validationService,
        private PermissionRepository $permissaoRepository
    ) {}

    public function execute(array $dados)
    {
        $this->validationService->validarDadosPermissao($dados);

        if ($this->permissaoRepository->permissaoExiste(
            $dados['user_id'],
            $dados['modulo_id'],
            $dados['autarquia_ativa_id']
        )) {
            throw new \Exception('Esta permissão já existe para este usuário.', 409);
        }

        $permissao = $this->permissaoRepository->criarPermissao($dados);
        $permissao->load(['user:id,name,email', 'modulo:id,nome,icone', 'autarquia:id,nome']);

        return $permissao;
    }
}
