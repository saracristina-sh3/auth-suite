<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AutarquiaSessionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SessionController extends Controller
{
    protected AutarquiaSessionService $autarquiaSession;

    public function __construct(AutarquiaSessionService $autarquiaSession)
    {
        $this->autarquiaSession = $autarquiaSession;
    }

    /**
     * Define a autarquia ativa na sessão atual
     *
     * POST /api/session/active-autarquia
     */
    public function setActiveAutarquia(Request $request)
    {
        $request->validate([
            'autarquia_id' => 'required|integer|exists:autarquias,id'
        ]);

        $user = Auth::user();
        $autarquiaId = $request->autarquia_id;

        $success = $this->autarquiaSession->setAutarquiaAtiva($autarquiaId, $user);

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Não foi possível definir esta autarquia como ativa'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Autarquia ativa definida com sucesso',
            'data' => [
                'autarquia_ativa_id' => session('autarquia_ativa_id'),
                'autarquia_ativa' => session('autarquia_ativa')
            ]
        ]);
    }

    /**
     * Obtém a autarquia ativa da sessão atual
     *
     * GET /api/session/active-autarquia
     */
    public function getActiveAutarquia(Request $request)
    {
        $autarquia = $this->autarquiaSession->getAutarquiaAtiva();

        return response()->json([
            'success' => true,
            'data' => [
                'autarquia_ativa_id' => session('autarquia_ativa_id'),
                'autarquia_ativa' => session('autarquia_ativa')
            ]
        ]);
    }

    /**
     * Remove a autarquia ativa da sessão
     *
     * DELETE /api/session/active-autarquia
     */
    public function clearActiveAutarquia(Request $request)
    {
        $this->autarquiaSession->clearAutarquiaAtiva();

        return response()->json([
            'success' => true,
            'message' => 'Autarquia ativa removida da sessão'
        ]);
    }
}
