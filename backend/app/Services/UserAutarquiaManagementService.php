<?php

namespace App\Services;

use App\Models\User;
use App\Models\Autarquia;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UserAutarquiaManagementService
{
    /**
     * Obtém autarquias vinculadas a um usuário
     */
    public function getUserAutarquias(User $user)
    {
        return $user->autarquias()
            ->select('autarquias.id', 'autarquias.nome', 'autarquias.ativo')
            ->withPivot('role', 'is_admin', 'is_default', 'ativo', 'data_vinculo')
            ->orderBy('autarquias.nome')
            ->get();
    }

    /**
     * Anexa autarquias a um usuário
     */
    public function attachAutarquias(User $user, array $autarquiaIds, array $pivotData = []): void
    {
        foreach ($autarquiaIds as $autarquiaId) {
            $user->autarquias()->attach($autarquiaId, array_merge([
                'role' => 'user',
                'is_admin' => false,
                'is_default' => false,
                'ativo' => true,
                'data_vinculo' => now(),
            ], $pivotData));
        }
    }

    /**
     * Desanexa autarquias de um usuário
     */
    public function detachAutarquias(User $user, array $autarquiaIds): void
    {
        $user->autarquias()->detach($autarquiaIds);
    }

    /**
     * Sincroniza autarquias de um usuário
     */
    public function syncAutarquias(User $user, array $autarquiasData): void
    {
        $syncData = [];
        foreach ($autarquiasData as $autarquiaEntry) {
            $autarquiaId = $autarquiaEntry['id'];
            $pivotData = $autarquiaEntry['pivot_data'] ?? [];
            $syncData[$autarquiaId] = array_merge([
                'role' => 'user',
                'is_admin' => false,
                'is_default' => false,
                'ativo' => true,
                'data_vinculo' => now(),
            ], $pivotData);
        }

        $user->autarquias()->sync($syncData);
    }

    /**
     * Atualiza autarquia ativa do usuário
     */
    public function updateActiveAutarquia(User $user, int $autarquiaId): void
    {
        if (!$user->autarquias()->where('autarquia_id', $autarquiaId)->exists()) {
            throw ValidationException::withMessages([
                'autarquia_ativa_id' => ['O usuário não está associado à autarquia fornecida.']
            ]);
        }

        $user->update(['autarquia_ativa_id' => $autarquiaId]);
    }

    /**
     * Valida se o usuário tem acesso à autarquia
     */
    public function userHasAccessToAutarquia(User $user, int $autarquiaId): bool
    {
        return $user->autarquias()
            ->where('autarquia_id', $autarquiaId)
            ->exists();
    }
}
