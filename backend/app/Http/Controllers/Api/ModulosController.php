<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Modulo;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use \App\Traits\ApiResponses;


class ModulosController extends Controller
{
    use ApiResponses;
    /**
     * Lista todos os módulos (com paginação)
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 10);

        $query = Modulo::query();

        // Filtrar por status ativo se solicitado
        if ($request->has('ativo')) {
            $query->where('ativo', $request->boolean('ativo'));
        }

        // ✅ Eager loading para evitar N+1
        // Sempre carregar contagem de autarquias para melhor performance
        $query->withCount('autarquias');

        // Incluir autarquias se solicitado
        if ($request->boolean('with_autarquias')) {
            $query->with('autarquiasAtivas:id,nome,ativo');
        }

        // Filtrar por autarquia específica se solicitado
        if ($request->has('autarquia_id')) {
            $query->whereHas('autarquiasAtivas', function ($q) use ($request) {
                $q->where('autarquia_id', $request->get('autarquia_id'));
            });
        }

        // Busca por nome ou descrição
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('nome', 'like', '%' . $search . '%')
                  ->orWhere('descricao', 'like', '%' . $search . '%');
            });
        }

        $modulos = $query->orderBy('nome')->paginate($perPage);

        return $this->successPaginatedResponse(
            $modulos,
            'Lista de módulos recuperada com sucesso.'
        );
    }

    /**
     * Exibe um módulo específico
     */
    public function show(Modulo $modulo): JsonResponse
    {
        $modulo->load(['autarquiasAtivas']);
        $modulo->loadCount('autarquias');

        return response()->json([
            'success' => true,
            'message' => 'Módulo recuperado com sucesso.',
            'data' => $modulo,
        ]);
    }

    /**
     * Cria um novo módulo
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255|unique:modulos',
            'descricao' => 'nullable|string',
            'icone' => 'nullable|string|max:100',
            'ativo' => 'boolean',
        ]);

        $modulo = Modulo::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Módulo criado com sucesso.',
            'data' => $modulo,
        ], 201);
    }

    /**
     * Atualiza um módulo existente
     */
    public function update(Request $request, Modulo $modulo): JsonResponse
    {
        $validated = $request->validate([
            'nome' => "sometimes|string|max:255|unique:modulos,nome,{$modulo->id}",
            'descricao' => 'sometimes|nullable|string',
            'icone' => 'sometimes|nullable|string|max:100',
            'ativo' => 'sometimes|boolean',
        ]);

        $modulo->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Módulo atualizado com sucesso.',
            'data' => $modulo,
        ]);
    }

    /**
     * Remove um módulo
     */
    public function destroy(Modulo $modulo): JsonResponse
    {
        if ($modulo->autarquias()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Não é possível excluir o módulo pois existem autarquias vinculadas.',
            ], 422);
        }

        $modulo->delete();

        return response()->json([
            'success' => true,
            'message' => 'Módulo excluído com sucesso.',
        ]);
    }

    /**
     * Lista as autarquias que têm acesso ao módulo
     */
    public function autarquias(Modulo $modulo): JsonResponse
    {
        $autarquias = $modulo->autarquiasAtivas()->get();

        return response()->json([
            'success' => true,
            'message' => 'Autarquias do módulo recuperadas com sucesso.',
            'data' => $autarquias,
        ]);
    }

    /**
     * Retorna estatísticas dos módulos
     */
    public function stats(): JsonResponse
    {
        $total = Modulo::count();
        $ativos = Modulo::where('ativo', true)->count();
        $inativos = Modulo::where('ativo', false)->count();

        return response()->json([
            'success' => true,
            'message' => 'Estatísticas de módulos recuperadas com sucesso.',
            'data' => [
                'total' => $total,
                'ativos' => $ativos,
                'inativos' => $inativos,
            ],
        ]);
    }
}
