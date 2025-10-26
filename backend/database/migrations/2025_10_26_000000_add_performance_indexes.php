<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adiciona índices para otimizar queries e evitar N+1 problems
     */
    public function up(): void
    {
        // ====================================
        // TABELA: users
        // ====================================
        if (!$this->indexExists('users', 'users_is_active_index')) {
            DB::statement('CREATE INDEX users_is_active_index ON users (is_active)');
        }

        if (!$this->indexExists('users', 'users_role_index')) {
            DB::statement('CREATE INDEX users_role_index ON users (role)');
        }

        if (!$this->indexExists('users', 'users_autarquia_preferida_id_index')) {
            DB::statement('CREATE INDEX users_autarquia_preferida_id_index ON users (autarquia_preferida_id)');
        }

        if (!$this->indexExists('users', 'users_active_role_index')) {
            DB::statement('CREATE INDEX users_active_role_index ON users (is_active, role)');
        }

        // ====================================
        // TABELA: autarquias
        // ====================================
        if (!$this->indexExists('autarquias', 'autarquias_ativo_index')) {
            DB::statement('CREATE INDEX autarquias_ativo_index ON autarquias (ativo)');
        }

        if (!$this->indexExists('autarquias', 'autarquias_nome_index')) {
            DB::statement('CREATE INDEX autarquias_nome_index ON autarquias (nome)');
        }

        // ====================================
        // TABELA: modulos
        // ====================================
        if (!$this->indexExists('modulos', 'modulos_ativo_index')) {
            DB::statement('CREATE INDEX modulos_ativo_index ON modulos (ativo)');
        }

        if (!$this->indexExists('modulos', 'modulos_nome_index')) {
            DB::statement('CREATE INDEX modulos_nome_index ON modulos (nome)');
        }

        // ====================================
        // TABELA: usuario_autarquia (N:N pivot)
        // ====================================
        if (!$this->indexExists('usuario_autarquia', 'usuario_autarquia_user_id_index')) {
            DB::statement('CREATE INDEX usuario_autarquia_user_id_index ON usuario_autarquia (user_id)');
        }

        if (!$this->indexExists('usuario_autarquia', 'usuario_autarquia_autarquia_id_index')) {
            DB::statement('CREATE INDEX usuario_autarquia_autarquia_id_index ON usuario_autarquia (autarquia_id)');
        }

        if (!$this->indexExists('usuario_autarquia', 'usuario_autarquia_ativo_index')) {
            DB::statement('CREATE INDEX usuario_autarquia_ativo_index ON usuario_autarquia (ativo)');
        }

        if (!$this->indexExists('usuario_autarquia', 'usuario_autarquia_user_autarquia_index')) {
            DB::statement('CREATE INDEX usuario_autarquia_user_autarquia_index ON usuario_autarquia (user_id, autarquia_id)');
        }

        if (!$this->indexExists('usuario_autarquia', 'usuario_autarquia_user_default_index')) {
            DB::statement('CREATE INDEX usuario_autarquia_user_default_index ON usuario_autarquia (user_id, is_default)');
        }

        // ====================================
        // TABELA: autarquia_modulo (N:N pivot)
        // ====================================
        if (!$this->indexExists('autarquia_modulo', 'autarquia_modulo_autarquia_id_index')) {
            DB::statement('CREATE INDEX autarquia_modulo_autarquia_id_index ON autarquia_modulo (autarquia_id)');
        }

        if (!$this->indexExists('autarquia_modulo', 'autarquia_modulo_modulo_id_index')) {
            DB::statement('CREATE INDEX autarquia_modulo_modulo_id_index ON autarquia_modulo (modulo_id)');
        }

        if (!$this->indexExists('autarquia_modulo', 'autarquia_modulo_ativo_index')) {
            DB::statement('CREATE INDEX autarquia_modulo_ativo_index ON autarquia_modulo (ativo)');
        }

        if (!$this->indexExists('autarquia_modulo', 'autarquia_modulo_autarquia_modulo_index')) {
            DB::statement('CREATE INDEX autarquia_modulo_autarquia_modulo_index ON autarquia_modulo (autarquia_id, modulo_id)');
        }

        if (!$this->indexExists('autarquia_modulo', 'autarquia_modulo_autarquia_ativo_index')) {
            DB::statement('CREATE INDEX autarquia_modulo_autarquia_ativo_index ON autarquia_modulo (autarquia_id, ativo)');
        }

        // ====================================
        // TABELA: usuario_modulo_permissao
        // ====================================
        if (!$this->indexExists('usuario_modulo_permissao', 'usuario_modulo_permissao_user_id_index')) {
            DB::statement('CREATE INDEX usuario_modulo_permissao_user_id_index ON usuario_modulo_permissao (user_id)');
        }

        if (!$this->indexExists('usuario_modulo_permissao', 'usuario_modulo_permissao_modulo_id_index')) {
            DB::statement('CREATE INDEX usuario_modulo_permissao_modulo_id_index ON usuario_modulo_permissao (modulo_id)');
        }

        if (!$this->indexExists('usuario_modulo_permissao', 'usuario_modulo_permissao_autarquia_id_index')) {
            DB::statement('CREATE INDEX usuario_modulo_permissao_autarquia_id_index ON usuario_modulo_permissao (autarquia_id)');
        }

        if (!$this->indexExists('usuario_modulo_permissao', 'usuario_modulo_permissao_ativo_index')) {
            DB::statement('CREATE INDEX usuario_modulo_permissao_ativo_index ON usuario_modulo_permissao (ativo)');
        }

        if (!$this->indexExists('usuario_modulo_permissao', 'usuario_modulo_permissao_user_modulo_autarquia_index')) {
            DB::statement('CREATE INDEX usuario_modulo_permissao_user_modulo_autarquia_index ON usuario_modulo_permissao (user_id, modulo_id, autarquia_id)');
        }

        if (!$this->indexExists('usuario_modulo_permissao', 'usuario_modulo_permissao_user_ativo_index')) {
            DB::statement('CREATE INDEX usuario_modulo_permissao_user_ativo_index ON usuario_modulo_permissao (user_id, ativo)');
        }
    }

    /**
     * Verifica se um índice existe no banco de dados (PostgreSQL)
     */
    private function indexExists(string $table, string $index): bool
    {
        $result = DB::select("
            SELECT EXISTS (
                SELECT 1
                FROM pg_indexes
                WHERE tablename = ?
                AND indexname = ?
            ) as exists
        ", [$table, $index]);

        return $result[0]->exists;
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // ====================================
        // TABELA: users
        // ====================================
        if ($this->indexExists('users', 'users_is_active_index')) {
            DB::statement('DROP INDEX IF EXISTS users_is_active_index');
        }

        if ($this->indexExists('users', 'users_role_index')) {
            DB::statement('DROP INDEX IF EXISTS users_role_index');
        }

        if ($this->indexExists('users', 'users_autarquia_preferida_id_index')) {
            DB::statement('DROP INDEX IF EXISTS users_autarquia_preferida_id_index');
        }

        if ($this->indexExists('users', 'users_active_role_index')) {
            DB::statement('DROP INDEX IF EXISTS users_active_role_index');
        }

        // ====================================
        // TABELA: autarquias
        // ====================================
        if ($this->indexExists('autarquias', 'autarquias_ativo_index')) {
            DB::statement('DROP INDEX IF EXISTS autarquias_ativo_index');
        }

        if ($this->indexExists('autarquias', 'autarquias_nome_index')) {
            DB::statement('DROP INDEX IF EXISTS autarquias_nome_index');
        }

        // ====================================
        // TABELA: modulos
        // ====================================
        if ($this->indexExists('modulos', 'modulos_ativo_index')) {
            DB::statement('DROP INDEX IF EXISTS modulos_ativo_index');
        }

        if ($this->indexExists('modulos', 'modulos_nome_index')) {
            DB::statement('DROP INDEX IF EXISTS modulos_nome_index');
        }

        // ====================================
        // TABELA: usuario_autarquia
        // ====================================
        if ($this->indexExists('usuario_autarquia', 'usuario_autarquia_user_id_index')) {
            DB::statement('DROP INDEX IF EXISTS usuario_autarquia_user_id_index');
        }

        if ($this->indexExists('usuario_autarquia', 'usuario_autarquia_autarquia_id_index')) {
            DB::statement('DROP INDEX IF EXISTS usuario_autarquia_autarquia_id_index');
        }

        if ($this->indexExists('usuario_autarquia', 'usuario_autarquia_ativo_index')) {
            DB::statement('DROP INDEX IF EXISTS usuario_autarquia_ativo_index');
        }

        if ($this->indexExists('usuario_autarquia', 'usuario_autarquia_user_autarquia_index')) {
            DB::statement('DROP INDEX IF EXISTS usuario_autarquia_user_autarquia_index');
        }

        if ($this->indexExists('usuario_autarquia', 'usuario_autarquia_user_default_index')) {
            DB::statement('DROP INDEX IF EXISTS usuario_autarquia_user_default_index');
        }

        // ====================================
        // TABELA: autarquia_modulo
        // ====================================
        if ($this->indexExists('autarquia_modulo', 'autarquia_modulo_autarquia_id_index')) {
            DB::statement('DROP INDEX IF EXISTS autarquia_modulo_autarquia_id_index');
        }

        if ($this->indexExists('autarquia_modulo', 'autarquia_modulo_modulo_id_index')) {
            DB::statement('DROP INDEX IF EXISTS autarquia_modulo_modulo_id_index');
        }

        if ($this->indexExists('autarquia_modulo', 'autarquia_modulo_ativo_index')) {
            DB::statement('DROP INDEX IF EXISTS autarquia_modulo_ativo_index');
        }

        if ($this->indexExists('autarquia_modulo', 'autarquia_modulo_autarquia_modulo_index')) {
            DB::statement('DROP INDEX IF EXISTS autarquia_modulo_autarquia_modulo_index');
        }

        if ($this->indexExists('autarquia_modulo', 'autarquia_modulo_autarquia_ativo_index')) {
            DB::statement('DROP INDEX IF EXISTS autarquia_modulo_autarquia_ativo_index');
        }

        // ====================================
        // TABELA: usuario_modulo_permissao
        // ====================================
        if ($this->indexExists('usuario_modulo_permissao', 'usuario_modulo_permissao_user_id_index')) {
            DB::statement('DROP INDEX IF EXISTS usuario_modulo_permissao_user_id_index');
        }

        if ($this->indexExists('usuario_modulo_permissao', 'usuario_modulo_permissao_modulo_id_index')) {
            DB::statement('DROP INDEX IF EXISTS usuario_modulo_permissao_modulo_id_index');
        }

        if ($this->indexExists('usuario_modulo_permissao', 'usuario_modulo_permissao_autarquia_id_index')) {
            DB::statement('DROP INDEX IF EXISTS usuario_modulo_permissao_autarquia_id_index');
        }

        if ($this->indexExists('usuario_modulo_permissao', 'usuario_modulo_permissao_ativo_index')) {
            DB::statement('DROP INDEX IF EXISTS usuario_modulo_permissao_ativo_index');
        }

        if ($this->indexExists('usuario_modulo_permissao', 'usuario_modulo_permissao_user_modulo_autarquia_index')) {
            DB::statement('DROP INDEX IF EXISTS usuario_modulo_permissao_user_modulo_autarquia_index');
        }

        if ($this->indexExists('usuario_modulo_permissao', 'usuario_modulo_permissao_user_ativo_index')) {
            DB::statement('DROP INDEX IF EXISTS usuario_modulo_permissao_user_ativo_index');
        }
    }
};
