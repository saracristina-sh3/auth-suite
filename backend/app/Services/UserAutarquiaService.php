<?php

namespace App\Services;

use App\Models\User;
use App\Models\Autarquia;
use Illuminate\Support\Facades\Log;

class UserAutarquiaService
{
    public function __construct(
        private AutarquiaSessionService $autarquiaSession
    ) {}

    /**
     * Obtém autarquias disponíveis para o usuário
     */
    public function getUserAutarquias(User $user): array
    {
        Log::info('📋 Listando autarquias do usuário', [
            'user_id' => $user->id,
            'is_superadmin' => $user->is_superadmin
        ]);

        if ($user->is_superadmin) {
            $autarquias = Autarquia::where('ativo', true)
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
                })->toArray();
        } else {
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
                })->toArray();
        }

        return $autarquias;
    }

    /**
     * Troca a autarquia ativa do usuário
     */
    public function switchAutarquia(User $user, int $autarquiaId): array
    {
        Log::info('🔄 Tentativa de trocar autarquia', [
            'user_id' => $user->id,
            'autarquia_atual' => $user->autarquia_ativa_id,
            'autarquia_nova' => $autarquiaId
        ]);

        $success = $user->trocarAutarquia($autarquiaId);

        if (!$success) {
            throw new \Exception('Você não tem acesso a esta autarquia.', 403);
        }

        // Recarrega o usuário com a nova autarquia ativa
        $user->load(['autarquiaAtiva', 'autarquias']);

        Log::info('✅ Autarquia trocada com sucesso', [
            'user_id' => $user->id,
            'autarquia_ativa_id' => $user->autarquia_ativa_id,
            'autarquia_nome' => $user->autarquiaAtiva?->nome
        ]);

        return [
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
        ];
    }

    /**
     * Obtém dados do usuário atual
     */
    public function getCurrentUserData(User $user): array
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
}
