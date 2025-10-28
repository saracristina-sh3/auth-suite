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

    /**
     * Verifica se permissão já existe
     */
    public function permissaoExiste(int $userId, int $moduloId, int $autarquiaId): bool
    {
        return UsuarioModuloPermissao::where('user_id', $userId)
            ->where('modulo_id', $moduloId)
            ->where('autarquia_ativa_id', $autarquiaId)
            ->exists();
    }

    /**
     * Cria uma nova permissão
     */
    public function criarPermissao(array $dados): UsuarioModuloPermissao
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

    /**
     * Atualiza uma permissão existente
     */
    public function atualizarPermissao(int $userId, int $moduloId, int $autarquiaId, array $dados): bool
    {
        return UsuarioModuloPermissao::where('user_id', $userId)
            ->where('modulo_id', $moduloId)
            ->where('autarquia_ativa_id', $autarquiaId)
            ->update($dados);
    }

    /**
     * Remove uma permissão
     */
    public function deletarPermissao(int $userId, int $moduloId, int $autarquiaId): bool
    {
        return UsuarioModuloPermissao::where('user_id', $userId)
            ->where('modulo_id', $moduloId)
            ->where('autarquia_ativa_id', $autarquiaId)
            ->delete();
    }

    /**
     * Busca permissões ativas de um usuário
     */
    public function getPermissoesAtivasUsuario(int $userId, int $autarquiaId): Collection
    {
        return UsuarioModuloPermissao::with('modulo')
            ->ativas()
            ->daAutarquia($autarquiaId)
            ->doUsuario($userId)
            ->get();
    }
}
