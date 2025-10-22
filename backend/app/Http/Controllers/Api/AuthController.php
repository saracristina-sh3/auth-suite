<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        \Log::info('🔐 Tentativa de login', [
            'email' => $request->email,
            'has_password' => !empty($request->password),
            'request_data' => $request->all()
        ]);

        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
    \Log::warning('❌ Login falhou - credenciais incorretas', [
        'email' => $request->email,
        'user_found' => $user !== null
    ]);

    return response()->json([
        'success' => false,
        'message' => 'Credenciais inválidas. Verifique seu email e senha.'
    ], 401);
}

        // Create real Sanctum token
        $token = $user->createToken('auth-token')->plainTextToken;

        // Load autarquia ativa e autarquias vinculadas
        $user->load(['autarquiaAtiva', 'autarquias']);

        \Log::info('✅ Login bem-sucedido', [
            'user_id' => $user->id,
            'email' => $user->email,
            'autarquia_ativa_id' => $user->autarquia_ativa_id,
            'autarquia_nome' => $user->autarquiaAtiva?->nome
        ]);

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'cpf' => $user->cpf,
                'role' => $user->role,
                'autarquia_ativa_id' => $user->autarquia_ativa_id,
                'autarquia' => $user->autarquiaAtiva ? [
                    'id' => $user->autarquiaAtiva->id,
                    'nome' => $user->autarquiaAtiva->nome,
                    'ativo' => $user->autarquiaAtiva->ativo,
                ] : null,
                'is_active' => $user->is_active,
                'is_superadmin' => $user->is_superadmin,
            ],
            'token' => $token,
            'message' => 'Login successful'
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

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
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

        // Verificar se o usuário está autenticado
        if (!$user) {
            \Log::warning('❌ Tentativa de acesso sem autenticação');
            return response()->json([
                'success' => false,
                'message' => 'Não autenticado.'
            ], 401);
        }

        \Log::info('🔄 Tentativa de assumir contexto de autarquia', [
            'user_id' => $user->id,
            'user_role' => $user->role,
            'is_superadmin' => $user->is_superadmin,
            'autarquia_ativa_id' => $request->autarquia_ativa_id
        ]);

        // Apenas usuários superadmin (Sh3) podem assumir contexto de outras autarquias
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
            'autarquia_ativa_id' => 'required|exists:autarquias,id'
        ]);

        $autarquia = \App\Models\Autarquia::with('modulos')->findOrFail($request->autarquia_ativa_id);

        if (!$autarquia->ativo) {
            \Log::warning('❌ Tentativa de acessar autarquia inativa', [
                'autarquia_ativa_id' => $autarquia->id,
                'autarquia_nome' => $autarquia->nome
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Esta autarquia está inativa.'
            ], 400);
        }

        // Criar um novo token com informações de contexto
        // O token antigo continua válido mas vamos criar um novo para a sessão de suporte
        $token = $user->createToken('support-context-token', [
            'support_mode' => true,
            'context_autarquia_ativa_id' => $autarquia->id
        ])->plainTextToken;

        \Log::info('✅ Contexto de autarquia assumido com sucesso', [
            'user_id' => $user->id,
            'autarquia_ativa_id' => $autarquia->id,
            'autarquia_nome' => $autarquia->nome,
            'modulos_count' => $autarquia->modulos->count()
        ]);

        return response()->json([
            'success' => true,
            'message' => "Contexto assumido: {$autarquia->nome}",
            'token' => $token,
            'context' => [
                'autarquia' => [
                    'id' => $autarquia->id,
                    'nome' => $autarquia->nome,
                    'ativo' => $autarquia->ativo,
                ],
                'support_mode' => true,
                'is_admin' => true,
                'modulos' => $autarquia->modulos->map(function($modulo) {
                    return [
                        'id' => $modulo->id,
                        'nome' => $modulo->nome,
                        'descricao' => $modulo->descricao,
                        'icone' => $modulo->icone,
                        'ativo' => $modulo->pivot->ativo ?? true,
                    ];
                }),
                'permissions' => [
                    'view' => true,
                    'create' => true,
                    'edit' => true,
                    'delete' => true,
                    'manage_users' => true,
                    'manage_modules' => true,
                ]
            ]
        ]);
    }

    /**
     * Retorna o usuário para seu contexto original
     */
    public function exitAutarquiaContext(Request $request)
    {
        \Log::info('🔙 Saindo do contexto de autarquia', [
            'user_id' => $request->user()->id
        ]);

        $user = $request->user();

        // Revoga o token de contexto atual
        $request->user()->currentAccessToken()->delete();

        // Cria um novo token normal
        $token = $user->createToken('auth-token')->plainTextToken;

        // Recarrega o usuário com sua autarquia ativa
        $user->load(['autarquiaAtiva', 'autarquias']);

        \Log::info('✅ Retornado ao contexto original', [
            'user_id' => $user->id,
            'autarquia_original_id' => $user->autarquia_ativa_id
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

        // Tenta trocar a autarquia
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
