<?php

namespace App\Services\Auth;

use App\Models\User;
use App\Models\Autarquia;
use App\Traits\CreatesTokens;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Services\AutarquiaSessionService;

class AuthService
{
    use CreatesTokens;

    public function __construct(
        private AutarquiaSessionService $autarquiaSession
    ) {}

    /**
     * Realiza login do usuário
     */
    public function login(array $credentials): array
    {
        if (!Auth::attempt(['email' => $credentials['email'], 'password' => $credentials['password']])) {
            Log::warning('❌ Login falhou - credenciais incorretas', [
                'email' => $credentials['email']
            ]);

            throw new \Exception('Credenciais inválidas. Verifique seu email e senha.', 401);
        }

        $user = Auth::user();

        if (!$user->is_active) {
            throw new \Exception('Usuário inativo. Entre em contato com o administrador.', 403);
        }

        $tokens = $this->createTokenPair($user);

        return [
            'user' => $this->formatUserData($user),
            'tokens' => $tokens
        ];
    }

    /**
     * Renova o access token usando refresh token
     */
    public function refreshToken(User $user, string $refreshToken): array
    {
        $tokens = $this->refreshAccessToken($user, $refreshToken);

        Log::info('🔄 Token renovado com sucesso', [
            'user_id' => $user->id,
            'email' => $user->email
        ]);

        return [
            'user' => $this->formatUserData($user),
            'tokens' => $tokens
        ];
    }

    /**
     * Assume contexto de autarquia para suporte
     */
    public function assumeAutarquiaContext(User $user, int $autarquiaId): array
    {
        if (!$user->is_superadmin) {
            throw new \Exception('Acesso negado. Apenas usuários de suporte podem usar esta funcionalidade.', 403);
        }

        $autarquia = Autarquia::with('modulos')->findOrFail($autarquiaId);

        if (!$autarquia->ativo) {
            throw new \Exception('Esta autarquia está inativa.', 400);
        }

        // Definir autarquia ativa na sessão
        $success = $this->autarquiaSession->setAutarquiaAtiva($autarquia->id, $user);

        if (!$success) {
            throw new \Exception('Não foi possível assumir o contexto desta autarquia.', 403);
        }

        // Configurar modo suporte
        session([
            'support_mode' => true,
            'support_context' => [
                'original_autarquia_preferida_id' => $user->autarquia_preferida_id,
                'assumed_at' => now()
            ]
        ]);

        // Criar token temporário para suporte
        $token = $this->createTemporaryToken($user, ['*'], 480);

        Log::info('✅ Contexto de autarquia assumido com sucesso', [
            'user_id' => $user->id,
            'autarquia_id' => $autarquia->id,
            'autarquia_nome' => $autarquia->nome
        ]);

        // CORREÇÃO: Retornar estrutura correta com 'data'
        return [
            'data' => [
                'context' => [
                    'autarquia' => [
                        'id' => $autarquia->id,
                        'nome' => $autarquia->nome,
                        'ativo' => $autarquia->ativo
                    ],
                    'support_mode' => true,
                    'is_admin' => true,
                    'modulos' => $autarquia->modulos,
                    'permissions' => [
                        'view' => true,
                        'create' => true,
                        'edit' => true,
                        'delete' => true,
                        'manage_users' => true,
                        'manage_modules' => true
                    ]
                ]
            ],
            'token' => $token
        ];
    }

    /**
     * Retorna ao contexto original
     */
    public function exitAutarquiaContext(User $user): array
    {
        Log::info('🔙 Saindo do contexto de autarquia', [
            'user_id' => $user->id
        ]);

        $supportContext = session('support_context');

        // Restaurar autarquia preferida
        if ($supportContext && isset($supportContext['original_autarquia_preferida_id'])) {
            if ($supportContext['original_autarquia_preferida_id']) {
                $this->autarquiaSession->setAutarquiaAtiva(
                    $supportContext['original_autarquia_preferida_id'],
                    $user
                );
            } else {
                $this->autarquiaSession->clearAutarquiaAtiva();
            }
        } else {
            $this->autarquiaSession->clearAutarquiaAtiva();
        }

        // Limpar flags de modo suporte
        session()->forget(['support_mode', 'support_context']);

        // Criar novos tokens normais
        $tokens = $this->createTokenPair($user);

        Log::info('✅ Retornado ao contexto original', [
            'user_id' => $user->id,
            'autarquia_preferida_id' => $user->autarquia_preferida_id
        ]);

        return [
            'user' => $this->formatUserData($user),
            'tokens' => $tokens
        ];
    }

    /**
     * Formata dados do usuário para resposta
     */
    private function formatUserData(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'cpf' => $user->cpf,
            'role' => $user->role,
            'is_superadmin' => $user->is_superadmin,
            'is_active' => $user->is_active,
            'autarquia_preferida_id' => $user->autarquia_preferida_id,
            'autarquia_preferida' => $user->autarquiaPreferida,
            'autarquia_ativa_id' => session('autarquia_ativa_id'),
            'autarquia_ativa' => session('autarquia_ativa'),
        ];
    }

    /**
     * Realiza logout revogando todos os tokens
     */
    public function logout(User $user): void
    {
        $this->revokeAllTokens($user);
    }
}
