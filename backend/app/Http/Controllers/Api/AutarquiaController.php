<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Autarquia;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AutarquiaController extends Controller
{
    /**
     * Lista todas as autarquias
     */
    public function index(Request $request): JsonResponse
    {
        $query = Autarquia::query();

        // Filtrar por status ativo se solicitado
        if ($request->has('ativo')) {
            $query->where('ativo', $request->boolean('ativo'));
        }

        // Incluir contagem de usuários se solicitado
        if ($request->boolean('with_users_count')) {
            $query->withCount('users');
        }

        // Incluir módulos se solicitado
        if ($request->boolean('with_modulos')) {
            $query->with('modulosAtivos');
        }

        $autarquias = $query->orderBy('nome')->get();

        return response()->json([
            'success' => true,
            'message' => 'Lista de autarquias recuperada com sucesso.',
            'data' => $autarquias,
        ]);
    }

    /**
     * Exibe uma autarquia específica
     */
    public function show(Autarquia $autarquia): JsonResponse
    {
        $autarquia->load(['modulosAtivos', 'users']);
        $autarquia->loadCount('users');

        return response()->json([
            'success' => true,
            'message' => 'Autarquia recuperada com sucesso.',
            'data' => $autarquia,
        ]);
    }

    /**
     * Cria uma nova autarquia
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255|unique:autarquias',
            'ativo' => 'boolean',
        ]);

        $autarquia = Autarquia::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Autarquia criada com sucesso.',
            'data' => $autarquia,
        ], 201);
    }

    /**
     * Atualiza uma autarquia existente
     */
    public function update(Request $request, Autarquia $autarquia): JsonResponse
    {
        $validated = $request->validate([
            'nome' => "sometimes|string|max:255|unique:autarquias,nome,{$autarquia->id}",
            'ativo' => 'sometimes|boolean',
        ]);

        $autarquia->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Autarquia atualizada com sucesso.',
            'data' => $autarquia,
        ]);
    }

    /**
     * Remove uma autarquia (soft delete ou validação)
     */
    public function destroy(Autarquia $autarquia): JsonResponse
    {
        // Verifica se a autarquia tem usuários
        if ($autarquia->users()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Não é possível excluir a autarquia pois existem usuários vinculados.',
            ], 422);
        }

        // Verifica se a autarquia tem módulos liberados
        if ($autarquia->modulos()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Não é possível excluir a autarquia pois existem módulos vinculados.',
            ], 422);
        }

        $autarquia->delete();

        return response()->json([
            'success' => true,
            'message' => 'Autarquia excluída com sucesso.',
        ]);
    }

    /**
     * Lista os módulos da autarquia
     */
    public function modulos(Autarquia $autarquia): JsonResponse
    {
        $modulos = $autarquia->modulosAtivos()->get();

        return response()->json([
            'success' => true,
            'message' => 'Módulos da autarquia recuperados com sucesso.',
            'data' => $modulos,
        ]);
    }

    /**
     * Lista os usuários da autarquia
     */
    public function usuarios(Autarquia $autarquia): JsonResponse
    {
        $usuarios = $autarquia->users()
            ->select('users.id', 'users.name', 'users.email', 'users.cpf', 'users.role', 'users.is_active')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Usuários da autarquia recuperados com sucesso.',
            'data' => $usuarios,
        ]);
    }
}
