<?php

namespace App\Repositories;

use App\Models\UsuarioModuloPermissao;
use Illuminate\Database\Eloquent\Collection;

class PermissionRepository
{
    /**
     * Busca permissões com filtros
     */
    public function getPermissoesComFiltros(array $filtros = []): Collection
    {
        $query = UsuarioModuloPermissao::with(['user:id,name,email', 'modulo:id,nome,icone', 'autarquia:id,nome']);

        if (isset($filtros['user_id'])) {
            $query->doUsuario($filtros['user_id']);
        }

        if (isset($filtros['modulo_id'])) {
            $query->doModulo($filtros['modulo_id']);
        }

        if (isset($filtros['autarquia_ativa_id'])) {
            $query->daAutarquia($filtros['autarquia_ativa_id']);
        }

        if (isset($filtros['ativo'])) {
            $query->where('ativo', $filtros['ativo']);
        }

        return $query->orderBy('data_concessao', 'desc')->get();
    }

    /**
     * Busca permissão específica
     */
    public function findPermissao(int $userId, int $moduloId, int $autarquiaId): ?UsuarioModuloPermissao
    {
        return UsuarioModuloPermissao::filtroCompleto($userId, $moduloId, $autarquiaId)
            ->with(['user:id,name,email', 'modulo:id,nome,icone', 'autarquia:id,nome'])
            ->first();
    }

    /**
     * Busca permissão ou falha
     */
    public function findPermissaoOrFail(int $userId, int $moduloId, int $autarquiaId): UsuarioModuloPermissao
    {
        $permissao = $this->findPermissao($userId, $moduloId, $autarquiaId);

        if (!$permissao) {
            abort(404, 'Permissão não encontrada');
        }

        return $permissao;
    }
}
