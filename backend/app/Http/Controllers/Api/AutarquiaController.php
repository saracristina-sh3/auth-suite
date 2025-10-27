<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Autarquia;
use App\Models\AutarquiaModulo;
use App\Models\Modulo;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AutarquiaController extends Controller
{
    use \App\Traits\ApiResponses;

    /**
     * Lista todas as autarquias (com paginação)
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 10);

        $query = Autarquia::query();

        // Filtrar por status ativo se solicitado
        if ($request->has('ativo')) {
            $query->where('ativo', $request->boolean('ativo'));
        }

        // ✅ Eager loading para evitar N+1
        // Sempre carregar contagem de usuários e módulos para melhor performance
        $query->withCount(['users', 'modulos']);

        // Incluir módulos se solicitado
        if ($request->boolean('with_modulos')) {
            $query->with('modulosAtivos');
        }

        // Incluir usuários se solicitado
        if ($request->boolean('with_users')) {
            $query->with('users:id,name,email');
        }

        // Busca por nome
        if ($request->has('search')) {
            $query->where('nome', 'like', '%' . $request->get('search') . '%');
        }

        $autarquias = $query->orderBy('nome')->paginate($perPage);

        return $this->successPaginatedResponse(
            $autarquias,
            'Lista de autarquias recuperada com sucesso.'
        );
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

        // Criar vínculos automáticos com todos os módulos (inativos)
        $modulos = Modulo::all();
        foreach ($modulos as $modulo) {
            AutarquiaModulo::firstOrCreate([
                'autarquia_id' => $autarquia->id,
                'modulo_id' => $modulo->id,
            ], [
                'ativo' => false,
                'data_liberacao' => now(),
            ]);
        }

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
        if ($autarquia->users()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Não é possível excluir a autarquia pois existem usuários vinculados.',
            ], 422);
        }

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
        $modulos = $autarquia->modulos()->get();

        return response()->json([
            'success' => true,
            'message' => 'Módulos da autarquia recuperados com sucesso.',
            'data' => $modulos,
        ]);
    }

    /**
     * Retorna estatísticas dos módulos da autarquia
     */
    public function modulosStats(Autarquia $autarquia): JsonResponse
    {
        $total = $autarquia->modulos()->count();
        $ativos = $autarquia->modulos()->wherePivot('ativo', true)->count();
        $inativos = $autarquia->modulos()->wherePivot('ativo', false)->count();

        return response()->json([
            'success' => true,
            'message' => 'Estatísticas dos módulos da autarquia recuperadas com sucesso.',
            'data' => [
                'total' => $total,
                'ativos' => $ativos,
                'inativos' => $inativos,
            ],
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

    /**
     * Retorna estatísticas das autarquias
     */
    public function stats(): JsonResponse
    {
        $total = Autarquia::count();
        $ativas = Autarquia::where('ativo', true)->count();
        $inativas = Autarquia::where('ativo', false)->count();

        return response()->json([
            'success' => true,
            'message' => 'Estatísticas de autarquias recuperadas com sucesso.',
            'data' => [
                'total' => $total,
                'ativas' => $ativas,
                'inativas' => $inativas,
            ],
        ]);
    }
}
