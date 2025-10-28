<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use App\Services\Auth\AuthService;
use App\Services\UserAutarquiaService;
use App\Traits\ApiResponses;


class AuthController extends Controller
{
    use ApiResponses;

    public function __construct(
        private AuthService $authService,
        private UserAutarquiaService $userAutarquiaService
    ) {}

    /**
     * Realiza login do usuário
     */
    public function login(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required'
            ]);

            $result = $this->authService->login($request->only(['email', 'password']));

            return response()->json([
                'success' => true,
                'message' => 'Login realizado com sucesso',
                'token' => $result['tokens']['token'],
                'refresh_token' => $result['tokens']['refresh_token'],
                'expires_in' => $result['tokens']['expires_in'],
                'user' => $result['user']
            ]);

        } catch (\Exception $e) {
            return $this->errorResponse(
                $e->getMessage(),
                $e->getCode() ?: 401
            );
        }
    }

    /**
     * Obtém usuário atual
     */
    public function getCurrentUser(Request $request)
    {
        try {
            $userData = $this->userAutarquiaService->getCurrentUserData($request->user());

            return response()->json([
                'user' => $userData
            ]);

        } catch (\Exception $e) {
            return $this->errorResponse('Erro ao recuperar dados do usuário.');
        }
    }

    /**
     * Renova access token
     */
    public function refresh(Request $request)
    {
        try {
            $request->validate([
                'refresh_token' => 'required|string'
            ]);

            $user = $request->user();

            if (!$user) {
                return $this->unauthorizedResponse('Não autenticado.');
            }

            $result = $this->authService->refreshToken($user, $request->refresh_token);

            return response()->json([
                'success' => true,
                'message' => 'Token renovado com sucesso',
                'token' => $result['tokens']['token'],
                'refresh_token' => $result['tokens']['refresh_token'],
                'expires_in' => $result['tokens']['expires_in'],
                'user' => $result['user']
            ]);

        } catch (\Exception $e) {
            return $this->errorResponse(
                $e->getMessage(),
                $e->getCode() ?: 401
            );
        }
    }

    /**
     * Realiza logout
     */
    public function logout(Request $request)
    {
        try {
            $this->authService->logout($request->user());

            return $this->successResponse(null, 'Logged out successfully');

        } catch (\Exception $e) {
            return $this->errorResponse('Erro ao realizar logout.');
        }
    }

    /**
     * Assume contexto de autarquia (suporte)
     */
    public function assumeAutarquiaContext(Request $request)
    {
        try {
            $request->validate([
                'autarquia_id' => 'required|exists:autarquias,id'
            ]);

            $result = $this->authService->assumeAutarquiaContext(
                $request->user(),
                $request->autarquia_id
            );

            // CORREÇÃO: Acessar a estrutura correta do resultado
            return response()->json([
                'success' => true,
                'message' => 'Contexto assumido: ' . $result['data']['context']['autarquia']['nome'],
                'data' => $result['data']['context'],
                'token' => $result['token']
            ]);

        } catch (\Exception $e) {
            return $this->errorResponse(
                $e->getMessage(),
                $e->getCode() ?: 400
            );
        }
    }

    /**
     * Retorna ao contexto original
     */
    public function exitAutarquiaContext(Request $request)
    {
        try {
            $result = $this->authService->exitAutarquiaContext($request->user());

            return response()->json([
                'success' => true,
                'message' => 'Retornado ao contexto original',
                'token' => $result['tokens']['token'],
                'user' => $result['user']
            ]);

        } catch (\Exception $e) {
            return $this->errorResponse('Erro ao retornar ao contexto original.');
        }
    }

    /**
     * Lista autarquias do usuário
     */
    public function getAutarquias(Request $request)
    {
        try {
            $autarquias = $this->userAutarquiaService->getUserAutarquias($request->user());

            return $this->successResponse([
                'autarquias' => $autarquias,
                'autarquia_ativa_id' => $request->user()->autarquia_ativa_id
            ], 'Autarquias recuperadas com sucesso');

        } catch (\Exception $e) {
            return $this->errorResponse('Erro ao listar autarquias.');
        }
    }

    /**
     * Troca autarquia ativa
     */
    public function switchAutarquia(Request $request)
    {
        try {
            $request->validate([
                'autarquia_ativa_id' => 'required|exists:autarquias,id'
            ]);

            $result = $this->userAutarquiaService->switchAutarquia(
                $request->user(),
                $request->autarquia_ativa_id
            );

            return $this->successResponse(
                $result['user'],
                'Autarquia alterada com sucesso'
            );

        } catch (\Exception $e) {
            return $this->errorResponse(
                $e->getMessage(),
                $e->getCode() ?: 400
            );
        }
    }

    /**
     * Endpoint para teste
     */
    public function me(Request $request)
    {
        return $this->successResponse(
            $request->user(),
            'Dados do usuário recuperados com sucesso'
        );
    }
}
