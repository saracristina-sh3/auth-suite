<?php

namespace App\Services;

use App\Models\User;
use App\Rules\CpfValidation;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class UserService
{
    /**
     * Valida e cria um novo usuário
     */
    public function createUser(array $data): User
    {
        $validator = Validator::make($data, [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'role' => 'required|string|in:user,gestor,admin,superadmin,clientAdmin',
            'cpf' => ['required', 'string', new CpfValidation, 'unique:users'],
            'autarquia_preferida_id' => 'required|exists:autarquias,id',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $validated = $validator->validated();

        // Se for superadmin, marcar is_superadmin como true
        $isSuperadmin = $validated['role'] === 'superadmin';

        // Remover formatação do CPF
        $cpfLimpo = preg_replace('/\D/', '', $validated['cpf']);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'cpf' => $cpfLimpo,
            'role' => $validated['role'],
            'autarquia_preferida_id' => $validated['autarquia_preferida_id'],
            'is_active' => $validated['is_active'] ?? true,
            'is_superadmin' => $isSuperadmin,
        ]);

        // Criar vínculo na tabela pivot usuario_autarquia
        $user->autarquias()->attach($validated['autarquia_preferida_id'], [
            'role' => $validated['role'],
            'is_admin' => $validated['role'] === 'clientAdmin',
            'is_default' => true,
            'ativo' => true,
            'data_vinculo' => now(),
        ]);

        return $user->load(['autarquiaPreferida:id,nome', 'autarquias']);
    }

    /**
     * Valida e atualiza um usuário existente
     */
    public function updateUser(User $user, array $data): User
    {
        $validator = Validator::make($data, [
            'name' => 'sometimes|string|max:255',
            "email" => "sometimes|email|unique:users,email,{$user->id}",
            "cpf" => ['sometimes', 'string', new CpfValidation, "unique:users,cpf,{$user->id}"],
            'role' => 'sometimes|string|in:user,gestor,admin,superadmin,clientAdmin',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $validated = $validator->validated();

        // Remover formatação do CPF se fornecido
        if (isset($validated['cpf'])) {
            $validated['cpf'] = preg_replace('/\D/', '', $validated['cpf']);
        }

        // Se mudou para superadmin, atualizar is_superadmin
        if (isset($validated['role'])) {
            $validated['is_superadmin'] = $validated['role'] === 'superadmin';
        }

        $user->update($validated);

        return $user->load(['autarquiaPreferida:id,nome', 'autarquias']);
    }

    /**
     * Exclui um usuário se não tiver permissões vinculadas
     */
    public function deleteUser(User $user): bool
    {
        if ($user->permissoes()->exists()) {
            throw new \Exception('Não é possível excluir o usuário pois existem permissões vinculadas.');
        }

        return $user->delete();
    }

    /**
     * Busca usuários com filtros
     */
    public function getUsers(array $filters = [])
    {
        $perPage = $filters['per_page'] ?? 10;

        $query = User::query()
            ->select('id', 'name', 'email', 'role', 'cpf', 'autarquia_preferida_id', 'is_active', 'is_superadmin')
            ->with([
                'autarquiaPreferida:id,nome',
                'autarquias:id,nome,ativo'
            ]);

        // Filtrar por autarquia se solicitado
        if (isset($filters['autarquia_preferida_id'])) {
            $query->where('autarquia_preferida_id', $filters['autarquia_preferida_id']);
        }

        // Filtrar por status ativo se solicitado
        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        return $query->orderBy('id', 'desc')->paginate($perPage);
    }

    /**
     * Obtém estatísticas dos usuários
     */
    public function getUserStats(): array
    {
        return [
            'total' => User::count(),
            'ativos' => User::where('is_active', true)->count(),
            'inativos' => User::where('is_active', false)->count(),
            'superadmins' => User::where('is_superadmin', true)->count(),
        ];
    }
}
