<?php

namespace App\Services;

use App\Models\User;
use App\Models\UsuarioModuloPermissao;

class PermissionService
{
    /**
     * Retorna as permissões baseadas no role
     */
    public function getRolePermissions(string $role): array
    {
        return match($role) {
            'user' => ['view_dashboard'],
            'clientAdmin' => ['view_dashboard', 'manage_users', 'view_reports'],
            'suporteAdmin' => ['view_dashboard', 'manage_users', 'manage_system', 'view_reports'],
            default => []
        };
    }

    /**
     * Verifica permissão específica em um módulo
     */
    public function checkModulePermission(User $user, int $moduloId, string $permissionType, ?int $autarquiaId = null): bool
    {
        if ($user->is_superadmin) {
            return true;
        }

        $autarquiaId = $autarquiaId ?? session('autarquia_ativa_id');

        return $user->permissoesAtivas()
            ->where('modulo_id', $moduloId)
            ->where('autarquia_id', $autarquiaId)
            ->where("permissao_{$permissionType}", true)
            ->exists();
    }

    /**
     * Concede permissão a um usuário
     */
    public function concederPermissao(int $userId, int $moduloId, int $autarquiaId, array $permissoes): UsuarioModuloPermissao
    {
        return UsuarioModuloPermissao::updateOrCreate(
            [
                'user_id' => $userId,
                'modulo_id' => $moduloId,
                'autarquia_id' => $autarquiaId
            ],
            array_merge($permissoes, [
                'data_concessao' => now(),
                'ativo' => true
            ])
        );
    }

    /**
     * Revoga permissões de um usuário
     */
    public function revogarPermissao(int $userId, int $moduloId, int $autarquiaId): bool
    {
        return UsuarioModuloPermissao::where('user_id', $userId)
            ->where('modulo_id', $moduloId)
            ->where('autarquia_id', $autarquiaId)
            ->update(['ativo' => false]);
    }

    /**
     * Verifica permissão específica diretamente no banco
     */
    public function verificarPermissaoDireta(int $userId, int $moduloId, int $autarquiaId, string $tipoPermissao): bool
    {
        $permissao = UsuarioModuloPermissao::ativas()
            ->filtroCompleto($userId, $moduloId, $autarquiaId)
            ->first();

        if (!$permissao) {
            return false;
        }

        return match($tipoPermissao) {
            'leitura' => $permissao->podeLer(),
            'escrita' => $permissao->podeEscrever(),
            'exclusao' => $permissao->podeExcluir(),
            'admin' => $permissao->eAdmin(),
            default => false
        };
    }

    /**
     * Sincroniza múltiplas permissões para um usuário
     */
    public function sincronizarPermissoes(int $userId, int $autarquiaId, array $permissoesModulos): bool
    {
        try {
            foreach ($permissoesModulos as $moduloId => $permissoes) {
                $this->concederPermissao($userId, $moduloId, $autarquiaId, $permissoes);
            }
            return true;
        } catch (\Exception $e) {
            // Log do erro
            logger()->error("Erro ao sincronizar permissões: {$e->getMessage()}");
            return false;
        }
    }

    /**
     * Copia permissões de um usuário para outro
     */
    public function copiarPermissoes(int $usuarioOrigemId, int $usuarioDestinoId, int $autarquiaId): bool
    {
        $permissoesOrigem = UsuarioModuloPermissao::ativas()
            ->daAutarquia($autarquiaId)
            ->doUsuario($usuarioOrigemId)
            ->get();

        foreach ($permissoesOrigem as $permissao) {
            $this->concederPermissao(
                $usuarioDestinoId,
                $permissao->modulo_id,
                $autarquiaId,
                [
                    'permissao_leitura' => $permissao->permissao_leitura,
                    'permissao_escrita' => $permissao->permissao_escrita,
                    'permissao_exclusao' => $permissao->permissao_exclusao,
                    'permissao_admin' => $permissao->permissao_admin,
                ]
            );
        }

        return true;
    }

    /**
     * Obtém todas as permissões de um usuário formatadas
     */
    public function getPermissoesFormatadas(int $userId, int $autarquiaId): array
    {
        return UsuarioModuloPermissao::with('modulo')
            ->ativas()
            ->daAutarquia($autarquiaId)
            ->doUsuario($userId)
            ->get()
            ->map(function ($permissao) {
                return [
                    'modulo' => $permissao->modulo->nome,
                    'leitura' => $permissao->podeLer(),
                    'escrita' => $permissao->podeEscrever(),
                    'exclusao' => $permissao->podeExcluir(),
                    'admin' => $permissao->eAdmin(),
                    'nivel' => $permissao->nivelPermissao(),
                ];
            })
            ->toArray();
    }

    public function verificarPermissaoUsuario(int $userId, int $moduloId): array
{
    $user = User::findOrFail($userId);

    $permissao = UsuarioModuloPermissao::where('user_id', $userId)
        ->where('modulo_id', $moduloId)
        ->where('autarquia_ativa_id', $user->autarquia_ativa_id)
        ->where('ativo', true)
        ->first();

    if (!$permissao) {
        return [
            'tem_acesso' => false,
            'pode_ler' => false,
            'pode_escrever' => false,
            'pode_excluir' => false,
            'e_admin' => false,
        ];
    }

    return [
        'tem_acesso' => true,
        'pode_ler' => $permissao->podeLer(),
        'pode_escrever' => $permissao->podeEscrever(),
        'pode_excluir' => $permissao->podeExcluir(),
        'e_admin' => $permissao->eAdmin(),
        'permissao' => $permissao,
    ];
}
}
