<?php

namespace App\Traits;

trait PermissionChecks
{
    /**
     * Verifica se o usuário tem permissão de leitura
     */
    public function podeLer(): bool
    {
        return $this->ativo && $this->permissao_leitura;
    }

    /**
     * Verifica se o usuário tem permissão de escrita
     */
    public function podeEscrever(): bool
    {
        return $this->ativo && $this->permissao_escrita;
    }

    /**
     * Verifica se o usuário tem permissão de exclusão
     */
    public function podeExcluir(): bool
    {
        return $this->ativo && $this->permissao_exclusao;
    }

    /**
     * Verifica se o usuário é admin do módulo
     */
    public function eAdmin(): bool
    {
        return $this->ativo && $this->permissao_admin;
    }

    /**
     * Verifica se tem pelo menos uma permissão básica
     */
    public function temAlgumaPermissao(): bool
    {
        return $this->ativo && (
            $this->permissao_leitura ||
            $this->permissao_escrita ||
            $this->permissao_exclusao ||
            $this->permissao_admin
        );
    }

    /**
     * Retorna o nível mais alto de permissão
     */
    public function nivelPermissao(): string
    {
        if (!$this->ativo) {
            return 'nenhuma';
        }

        if ($this->permissao_admin) {
            return 'admin';
        }

        if ($this->permissao_exclusao) {
            return 'exclusao';
        }

        if ($this->permissao_escrita) {
            return 'escrita';
        }

        if ($this->permissao_leitura) {
            return 'leitura';
        }

        return 'nenhuma';
    }
}
