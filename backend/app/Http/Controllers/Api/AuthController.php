<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Services\AutarquiaSessionService;
use App\Traits\CreatesTokens;
use \App\Traits\ApiResponses;

class AuthController extends Controller
{
    use CreatesTokens, ApiResponses;

    protected AutarquiaSessionService $autarquiaSession;

    public function __construct(AutarquiaSessionService $autarquiaSession)
    {
        $this->autarquiaSession = $autarquiaSession;
    }

    public function login(Request $request)
    {
        if (!Auth::attempt(['email' => $request->email, 'password' => $request->password])) {
            \Log::warning('❌ Login falhou - credenciais incorretas', [
                'email' => $request->email
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Credenciais inválidas. Verifique seu email e senha.'
            ], 401);
        }

        $user = Auth::user();

        // ✅ Usar trait para criar tokens
        $tokens = $this->createTokenPair($user);

        return response()->json([
            'success' => true,
            'message' => 'Login realizado com sucesso',
            'token' => $tokens['token'],
            'refresh_token' => $tokens['refresh_token'],
            'expires_in' => $tokens['expires_in'],
            'user' => [
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
            ]
        ]);
    }

    public function getCurrentUser(Request $request)
    {
        $user = Auth::user();

        return response()->json([
            'user' => [
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
            ]
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ], 201);
    }

    /**
     * Renova o access token usando o refresh token
     */
    public function refresh(Request $request)
    {
        $request->validate([
            'refresh_token' => 'required|string'
        ]);

        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Não autenticado.'
            ], 401);
        }

        try {
            // ✅ Usar trait para renovar tokens
            $tokens = $this->refreshAccessToken($user, $request->refresh_token);

            \Log::info('🔄 Token renovado com sucesso', [
                'user_id' => $user->id,
                'email' => $user->email
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Token renovado com sucesso',
                'token' => $tokens['token'],
                'refresh_token' => $tokens['refresh_token'],
                'expires_in' => $tokens['expires_in'],
                'user' => [
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
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('❌ Erro ao renovar token', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 401);
        }
    }

    public function logout(Request $request)
    {
        $user = $request->user();

        // ✅ Usar trait para revogar todos os tokens
        $this->revokeAllTokens($user);

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user()
        ]);
    }

    /**
     * Permite que um usuário de suporte (Sh3) assuma o contexto de uma autarquia específica
     * com permissões completas de admin para aquela autarquia e seus módulos
     */
public function assumeAutarquiaContext(Request $request)
{
    $user = $request->user();

    if (!$user) {
        \Log::warning('❌ Tentativa de acesso sem autenticação');
        return response()->json([
            'success' => false,
            'message' => 'Não autenticado.'
        ], 401);
    }

    if (!$user->is_superadmin) {
        \Log::warning('❌ Acesso negado - usuário não é superadmin', [
            'user_id' => $user->id,
            'role' => $user->role
        ]);

        return response()->json([
            'success' => false,
            'message' => 'Acesso negado. Apenas usuários de suporte podem usar esta funcionalidade.'
        ], 403);
    }

    $request->validate([
        'autarquia_id' => 'required|exists:autarquias,id'
    ]);

    $autarquia = \App\Models\Autarquia::with('modulos')->findOrFail($request->autarquia_id);

    if (!$autarquia->ativo) {
        \Log::warning('❌ Tentativa de acessar autarquia inativa', [
            'autarquia_id' => $autarquia->id,
            'autarquia_nome' => $autarquia->nome
        ]);

        return response()->json([
            'success' => false,
            'message' => 'Esta autarquia está inativa.'
        ], 400);
    }

    // ✅ Usar o AutarquiaSessionService para definir na session
    $success = $this->autarquiaSession->setAutarquiaAtiva($autarquia->id, $user);

    if (!$success) {
        return response()->json([
            'success' => false,
            'message' => 'Não foi possível assumir o contexto desta autarquia.'
        ], 403);
    }

    // Adicionar flags de modo suporte na session
    session([
        'support_mode' => true,
        'support_context' => [
            'original_autarquia_preferida_id' => $user->autarquia_preferida_id,
            'assumed_at' => now()
        ]
    ]);

    // ✅ Criar token temporário para suporte (expira em 8 horas)
    $token = $this->createTemporaryToken($user, ['*'], 480);

    \Log::info('✅ Contexto de autarquia assumido com sucesso', [
        'user_id' => $user->id,
        'autarquia_id' => $autarquia->id,
        'autarquia_nome' => $autarquia->nome,
        'modulos_count' => $autarquia->modulos->count()
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Contexto assumido: ' . $autarquia->nome,
        'token' => $token,
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
    ]);
}

    /**
     * Retorna o usuário para seu contexto original
     */
public function exitAutarquiaContext(Request $request)
{
    $user = $request->user();

    \Log::info('🔙 Saindo do contexto de autarquia', [
        'user_id' => $user->id
    ]);

    // Restaurar autarquia preferida se existir no support_context
    $supportContext = session('support_context');

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
        // Fallback: limpar session
        $this->autarquiaSession->clearAutarquiaAtiva();
    }

    // Limpar flags de modo suporte
    session()->forget(['support_mode', 'support_context']);

    // ✅ Criar novo par de tokens normais
    $tokens = $this->createTokenPair($user);
    $token = $tokens['token'];

    \Log::info('✅ Retornado ao contexto original', [
        'user_id' => $user->id,
        'autarquia_preferida_id' => $user->autarquia_preferida_id
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Retornado ao contexto original',
        'token' => $token,
        'user' => [
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
        ]
    ]);
}


    /**
     * Lista todas as autarquias que o usuário tem acesso
     * (Para usuários vinculados a múltiplas autarquias)
     */
    public function getAutarquias(Request $request)
    {
        $user = $request->user();

        \Log::info('📋 Listando autarquias do usuário', [
            'user_id' => $user->id,
            'is_superadmin' => $user->is_superadmin
        ]);

        // Superadmin SH3 vê todas as autarquias ativas
        if ($user->is_superadmin) {
            $autarquias = \App\Models\Autarquia::where('ativo', true)
                ->orderBy('nome')
                ->get()
                ->map(function($autarquia) {
                    return [
                        'id' => $autarquia->id,
                        'nome' => $autarquia->nome,
                        'ativo' => $autarquia->ativo,
                        'role' => 'suporteAdmin',
                        'is_admin' => true,
                    ];
                });
        } else {
            // Usuários normais veem apenas suas autarquias vinculadas
            $autarquias = $user->autarquiasAtivas()
                ->orderBy('nome')
                ->get()
                ->map(function($autarquia) {
                    return [
                        'id' => $autarquia->id,
                        'nome' => $autarquia->nome,
                        'ativo' => $autarquia->ativo,
                        'role' => $autarquia->pivot->role,
                        'is_admin' => $autarquia->pivot->is_admin,
                        'data_vinculo' => $autarquia->pivot->data_vinculo,
                    ];
                });
        }

        return response()->json([
            'success' => true,
            'autarquias' => $autarquias,
            'autarquia_ativa_id' => $user->autarquia_ativa_id ?? $user->autarquia_ativa_id,
        ]);
    }

    /**
     * Troca a autarquia ativa do usuário
     * (Para usuários vinculados a múltiplas autarquias)
     */
    public function switchAutarquia(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'autarquia_ativa_id' => 'required|exists:autarquias,id'
        ]);

        \Log::info('🔄 Tentativa de trocar autarquia', [
            'user_id' => $user->id,
            'autarquia_atual' => $user->autarquia_ativa_id ?? $user->autarquia_ativa_id,
            'autarquia_nova' => $request->autarquia_ativa_id
        ]);

        $sucesso = $user->trocarAutarquia($request->autarquia_ativa_id);

        if (!$sucesso) {
            \Log::warning('❌ Usuário não tem acesso à autarquia solicitada', [
                'user_id' => $user->id,
                'autarquia_ativa_id' => $request->autarquia_ativa_id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Você não tem acesso a esta autarquia.'
            ], 403);
        }

        // Recarrega o usuário com a nova autarquia ativa
        $user->load(['autarquiaAtiva', 'autarquias']);

        \Log::info('✅ Autarquia trocada com sucesso', [
            'user_id' => $user->id,
            'autarquia_ativa_id' => $user->autarquia_ativa_id,
            'autarquia_nome' => $user->autarquiaAtiva?->nome
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Autarquia alterada com sucesso',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->getRoleParaAutarquia($user->autarquia_ativa_id),
                'autarquia_ativa_id' => $user->autarquia_ativa_id,
                'autarquia' => $user->autarquiaAtiva ? [
                    'id' => $user->autarquiaAtiva->id,
                    'nome' => $user->autarquiaAtiva->nome,
                    'ativo' => $user->autarquiaAtiva->ativo,
                ] : null,
                'is_active' => $user->is_active,
                'is_superadmin' => $user->is_superadmin,
            ]
        ]);
    }
}
