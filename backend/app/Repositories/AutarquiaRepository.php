<?php

namespace App\Repositories;

use App\Models\Autarquia;
use Illuminate\Pagination\LengthAwarePaginator;

class AutarquiaRepository
{
    /**
     * Busca autarquias paginadas com filtros
     */
    public function getAutarquiasPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = Autarquia::query();

        // Filtrar por status ativo
        if (isset($filters['ativo'])) {
            $query->where('ativo', $filters['ativo']);
        }

        // Busca por nome
        if (isset($filters['search'])) {
            $query->where('nome', 'like', '%' . $filters['search'] . '%');
        }

        // Carregar contagens
        $query->withCount(['users', 'modulos']);

        // Carregar relacionamentos condicionais
        if (isset($filters['with_modulos']) && $filters['with_modulos']) {
            $query->with('modulosAtivos');
        }

        if (isset($filters['with_users']) && $filters['with_users']) {
            $query->with('users:id,name,email');
        }

        return $query->orderBy('nome')->paginate($perPage);
    }

    /**
     * Busca autarquia por ID com relacionamentos
     */
    public function findById(int $id, array $with = []): ?Autarquia
    {
        return Autarquia::with($with)->find($id);
    }

    /**
     * Busca autarquia com todos os relacionamentos para show
     */
    public function getAutarquiaWithRelations(int $id): ?Autarquia
    {
        return Autarquia::with(['modulosAtivos', 'users'])
            ->withCount('users')
            ->find($id);
    }

    /**
     * Busca módulos de uma autarquia
     */
    public function getModulosByAutarquia(int $autarquiaId)
    {
        return Autarquia::find($autarquiaId)->modulos()->get();
    }

    /**
     * Busca usuários de uma autarquia
     */
    public function getUsuariosByAutarquia(int $autarquiaId)
    {
        return Autarquia::find($autarquiaId)
            ->users()
            ->select('users.id', 'users.name', 'users.email', 'users.cpf', 'users.role', 'users.is_active')
            ->get();
    }

    /**
     * Verifica se autarquia tem usuários vinculados
     */
    public function hasUsers(Autarquia $autarquia): bool
    {
        return $autarquia->users()->exists();
    }

    /**
     * Verifica se autarquia tem módulos vinculados
     */
    public function hasModulos(Autarquia $autarquia): bool
    {
        return $autarquia->modulos()->exists();
    }

    /**
     * Obtém estatísticas globais
     */
    public function getGlobalStats(): array
    {
        return [
            'total' => Autarquia::count(),
            'ativas' => Autarquia::where('ativo', true)->count(),
            'inativas' => Autarquia::where('ativo', false)->count(),
        ];
    }
}
