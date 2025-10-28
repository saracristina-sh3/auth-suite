<?php

namespace App\Repositories;

use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

class UserRepository
{
    public function findById(int $id, array $with = []): ?User
    {
        return User::with($with)->find($id);
    }

    public function getUsersPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = User::query()
            ->select('id', 'name', 'email', 'role', 'cpf', 'autarquia_preferida_id', 'is_active', 'is_superadmin')
            ->with([
                'autarquiaPreferida:id,nome',
                'autarquias:id,nome,ativo'
            ]);

        if (isset($filters['autarquia_preferida_id'])) {
            $query->where('autarquia_preferida_id', $filters['autarquia_preferida_id']);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        return $query->orderBy('id', 'desc')->paginate($perPage);
    }

    public function getUserWithPermissions(int $userId): ?User
    {
        return User::with([
            'autarquiaPreferida:id,nome',
            'autarquias',
            'permissoesAtivas.modulo:id,nome',
            'permissoesAtivas.autarquia:id,nome'
        ])->find($userId);
    }

    public function getUserStats(): array
    {
        return [
            'total' => User::count(),
            'ativos' => User::where('is_active', true)->count(),
            'inativos' => User::where('is_active', false)->count(),
            'superadmins' => User::where('is_superadmin', true)->count(),
        ];
    }

    public function userHasPermissions(User $user): bool
    {
        return $user->permissoes()->exists();
    }
}
