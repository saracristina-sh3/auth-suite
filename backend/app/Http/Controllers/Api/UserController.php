<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use App\Rules\CpfValidation;
use App\Traits\ApiResponses;

class UserController extends Controller
{
    use ApiResponses;
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 10);

        $query = User::query()
            ->select('id', 'name', 'email', 'role', 'cpf', 'autarquia_preferida_id', 'is_active', 'is_superadmin')
            ->with('autarquiaPreferida:id,nome');

        // Filtrar por autarquia se solicitado
        if ($request->has('autarquia_preferida_id')) {
            $query->where('autarquia_preferida_id', $request->get('autarquia_preferida_id'));
        }

        // Filtrar por status ativo se solicitado
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $users = $query->orderBy('id', 'desc')->paginate($perPage);

        return $this->successPaginatedResponse(
            $users,
            'Lista de usuários recuperada com sucesso.'
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'role' => 'required|string|in:user,gestor,admin,superadmin,clientAdmin',
            'cpf' => ['required', 'string', new CpfValidation, 'unique:users'],
            'autarquia_preferida_id' => 'required|exists:autarquias,id',
            'is_active' => 'boolean',
        ]);

        // Se for superadmin, marcar is_superadmin como true
        $isSuperadmin = $validated['role'] === 'superadmin';

        // Remover formatação do CPF (manter apenas números)
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

        // Carregar relacionamentos
        $user->load(['autarquiaPreferida:id,nome', 'autarquias']);

        return $this->createdResponse($user, 'Usuário criado com sucesso.');
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            "email" => "sometimes|email|unique:users,email,{$user->id}",
            "cpf" => ['sometimes', 'string', new CpfValidation, "unique:users,cpf,{$user->id}"],
            'role' => 'sometimes|string|in:user,gestor,admin,superadmin,clientAdmin',
            'is_active' => 'sometimes|boolean',
        ]);

        // Remover formatação do CPF se fornecido (manter apenas números)
        if (isset($validated['cpf'])) {
            $validated['cpf'] = preg_replace('/\D/', '', $validated['cpf']);
        }

        // Se mudou para superadmin, atualizar is_superadmin
        if (isset($validated['role'])) {
            $validated['is_superadmin'] = $validated['role'] === 'superadmin';
        }

        $user->update($validated);

        // Carregar relacionamentos
        $user->load(['autarquiaPreferida:id,nome', 'autarquias']);

        return $this->updatedResponse($user, 'Usuário atualizado com sucesso.');
    }

    public function destroy(User $user): JsonResponse
    {
        // Verificar se o usuário tem permissões vinculadas
        if ($user->permissoes()->exists()) {
            return $this->validationErrorResponse(
                ['user' => ['Não é possível excluir o usuário pois existem permissões vinculadas.']],
                'Não é possível excluir o usuário pois existem permissões vinculadas.'
            );
        }

        $user->delete();

        return $this->deletedResponse('Usuário excluído com sucesso.');
    }

    /**
     * Exibe um usuário específico com suas permissões
     */
    public function show(User $user): JsonResponse
    {
        $user->load(['autarquiaPreferida:id,nome', 'autarquias', 'permissoesAtivas.modulo:id,nome', 'permissoesAtivas.autarquia:id,nome']);

        return $this->successResponse($user, 'Usuário recuperado com sucesso.');
    }

    /**
     * Retorna os módulos disponíveis para o usuário
     */
    public function modulos(User $user): JsonResponse
    {
        $modulos = $user->getModulosDisponiveis();

        return $this->successResponse($modulos, 'Módulos do usuário recuperados com sucesso.');
    }

    /**
     * Retorna estatísticas dos usuários
     */
    public function stats(): JsonResponse
    {
        $total = User::count();
        $ativos = User::where('is_active', true)->count();
        $inativos = User::where('is_active', false)->count();
        $superadmins = User::where('is_superadmin', true)->count();

        return $this->successResponse([
            'total' => $total,
            'ativos' => $ativos,
            'inativos' => $inativos,
            'superadmins' => $superadmins,
        ], 'Estatísticas de usuários recuperadas com sucesso.');
    }
}
