<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 10);

        $query = User::query()
            ->select('id', 'name', 'email', 'role', 'cpf', 'autarquia_ativa_id', 'is_active', 'is_superadmin')
            ->with('autarquiaAtiva:id,nome');

        // Filtrar por autarquia se solicitado
        if ($request->has('autarquia_ativa_id')) {
            $query->where('autarquia_ativa_id', $request->get('autarquia_ativa_id'));
        }

        // Filtrar por status ativo se solicitado
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $users = $query->orderBy('id', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Lista de usuários recuperada com sucesso.',
            'items' => $users->items(),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'role' => 'required|string|in:user,gestor,admin,superadmin,clientAdmin',
            'cpf' => 'required|string|size:11|unique:users',
            'autarquia_ativa_id' => 'required|exists:autarquias,id',
            'is_active' => 'boolean',
        ]);

        // Se for superadmin, marcar is_superadmin como true
        $isSuperadmin = $validated['role'] === 'superadmin';

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'cpf' => $validated['cpf'],
            'role' => $validated['role'],
            'autarquia_ativa_id' => $validated['autarquia_ativa_id'],
            'is_active' => $validated['is_active'] ?? true,
            'is_superadmin' => $isSuperadmin,
        ]);

        // Criar vínculo na tabela pivot usuario_autarquia
        $user->autarquias()->attach($validated['autarquia_ativa_id'], [
            'role' => $validated['role'],
            'is_admin' => $validated['role'] === 'clientAdmin',
            'is_default' => true,
            'ativo' => true,
            'data_vinculo' => now(),
        ]);

        // Carregar relacionamentos
        $user->load(['autarquiaAtiva:id,nome', 'autarquias']);

        return response()->json([
            'success' => true,
            'message' => 'Usuário criado com sucesso.',
            'data' => $user,
        ], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            "email" => "sometimes|email|unique:users,email,{$user->id}",
            "cpf" => "sometimes|string|size:11|unique:users,cpf,{$user->id}",
            'role' => 'sometimes|string|in:user,gestor,admin,superadmin,clientAdmin',
            'is_active' => 'sometimes|boolean',
        ]);

        // Se mudou para superadmin, atualizar is_superadmin
        if (isset($validated['role'])) {
            $validated['is_superadmin'] = $validated['role'] === 'superadmin';
        }

        $user->update($validated);

        // Carregar relacionamentos
        $user->load(['autarquiaAtiva:id,nome', 'autarquias']);

        return response()->json([
            'success' => true,
            'message' => 'Usuário atualizado com sucesso.',
            'data' => $user,
        ]);
    }

    public function destroy(User $user): JsonResponse
    {
        // Verificar se o usuário tem permissões vinculadas
        if ($user->permissoes()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Não é possível excluir o usuário pois existem permissões vinculadas.',
            ], 422);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Usuário excluído com sucesso.',
        ]);
    }

    /**
     * Exibe um usuário específico com suas permissões
     */
    public function show(User $user): JsonResponse
    {
        $user->load(['autarquiaAtiva:id,nome', 'autarquias', 'permissoesAtivas.modulo:id,nome', 'permissoesAtivas.autarquia:id,nome']);

        return response()->json([
            'success' => true,
            'message' => 'Usuário recuperado com sucesso.',
            'data' => $user,
        ]);
    }

    /**
     * Retorna os módulos disponíveis para o usuário
     */
    public function modulos(User $user): JsonResponse
    {
        $modulos = $user->getModulosDisponiveis();

        return response()->json([
            'success' => true,
            'message' => 'Módulos do usuário recuperados com sucesso.',
            'data' => $modulos,
        ]);
    }
}
