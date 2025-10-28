<?php

namespace App\Services;

use App\Models\User;
use App\Models\Modulo;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PermissionValidationService
{
    /**
     * Valida se usuário pertence à autarquia
     */
    public function validarUsuarioAutarquia(User $user, int $autarquiaId): void
    {
        if ($user->autarquia_ativa_id != $autarquiaId) {
            throw ValidationException::withMessages([
                'autarquia_ativa_id' => ['O usuário não pertence a esta autarquia.']
            ]);
        }
    }

    /**
     * Valida se módulo está liberado para autarquia
     */
    public function validarModuloAutarquia(int $autarquiaId, int $moduloId): void
    {
        $moduloLiberado = DB::table('autarquia_modulo')
            ->where('autarquia_ativa_id', $autarquiaId)
            ->where('modulo_id', $moduloId)
            ->where('ativo', true)
            ->exists();

        if (!$moduloLiberado) {
            throw ValidationException::withMessages([
                'modulo_id' => ['O módulo não está liberado para esta autarquia.']
            ]);
        }
    }

    /**
     * Valida dados para criação de permissão
     */
    public function validarDadosPermissao(array $dados): void
    {
        $user = User::find($dados['user_id']);
        $this->validarUsuarioAutarquia($user, $dados['autarquia_ativa_id']);
        $this->validarModuloAutarquia($dados['autarquia_ativa_id'], $dados['modulo_id']);
    }

    /**
     * Valida dados para permissões em lote
     */
    public function validarDadosPermissaoLote(array $dados): void
    {
        $user = User::find($dados['user_id']);
        $this->validarUsuarioAutarquia($user, $dados['autarquia_ativa_id']);
    }
}
