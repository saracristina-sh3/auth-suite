<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Autarquia;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SessionAutarquiaController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $session = $request->session();
        $autarquiaId = $session->get($user->getAutarquiaSessionKey());

        $autarquia = null;
        if ($autarquiaId) {
            $autarquia = Autarquia::select('id', 'nome', 'ativo')
                ->find($autarquiaId);
        }

        return response()->json([
            'autarquia_id' => $autarquia?->id,
            'autarquia' => $autarquia,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validate([
            'autarquia_id' => ['required', 'integer', 'exists:autarquias,id'],
        ]);

        $autarquiaId = (int) $validated['autarquia_id'];

        if (!$user->is_superadmin) {
            $temAcesso = $user->autarquias()
                ->where('autarquia_id', $autarquiaId)
                ->wherePivot('ativo', true)
                ->exists();

            if (!$temAcesso) {
                return response()->json([
                    'message' => 'Você não possui acesso a esta autarquia.',
                ], 403);
            }
        }

        $autarquia = Autarquia::select('id', 'nome', 'ativo')->findOrFail($autarquiaId);

        // Persistimos o valor na sessão através do método do modelo para manter um ponto único da lógica
        $user->setAutarquiaContext($autarquia->id);

        return response()->json([
            'autarquia_id' => $autarquia->id,
            'autarquia' => $autarquia,
        ]);
    }
}
