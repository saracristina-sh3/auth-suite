<?php

namespace App\Traits;

trait PermissionScopes
{
    /**
     * Scope: Apenas permissões ativas
     */
    public function scopeAtivas($query)
    {
        return $query->where('ativo', true);
    }

    /**
     * Scope: Permissões de um usuário específico
     */
    public function scopeDoUsuario($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope: Permissões de uma autarquia específica
     */
    public function scopeDaAutarquia($query, int $autarquiaId)
    {
        return $query->where('autarquia_id', $autarquiaId);
    }

    /**
     * Scope: Permissões de um módulo específico
     */
    public function scopeDoModulo($query, int $moduloId)
    {
        return $query->where('modulo_id', $moduloId);
    }

    /**
     * Scope: Permissões com filtro combinado
     */
    public function scopeFiltroCompleto($query, int $userId, int $moduloId, int $autarquiaId)
    {
        return $query->where('user_id', $userId)
                    ->where('modulo_id', $moduloId)
                    ->where('autarquia_id', $autarquiaId);
    }
}
