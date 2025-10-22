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
     * Adiciona uma chave primária artificial (id) à tabela autarquia_modulo
     * e mantém uma constraint única composta para prevenir duplicatas.
     */
    public function up(): void
    {
        // PASSO 1: Remover foreign key composta da tabela usuario_modulo_permissao
        // que depende da primary key de autarquia_modulo
        $foreignKeys = DB::select("
            SELECT constraint_name
            FROM information_schema.table_constraints
            WHERE table_name = 'usuario_modulo_permissao'
            AND constraint_type = 'FOREIGN KEY'
            AND constraint_name LIKE '%autarquia_id%modulo_id%'
        ");

        if (!empty($foreignKeys)) {
            $constraintName = $foreignKeys[0]->constraint_name;
            DB::statement("ALTER TABLE usuario_modulo_permissao DROP CONSTRAINT {$constraintName}");
        }

        // PASSO 2: Remover a chave primária composta da tabela autarquia_modulo
        Schema::table('autarquia_modulo', function (Blueprint $table) {
            $table->dropPrimary(['autarquia_id', 'modulo_id']);
        });

        // PASSO 3: Adicionar coluna id como chave primária auto_increment
        DB::statement('ALTER TABLE autarquia_modulo ADD COLUMN id BIGSERIAL PRIMARY KEY');

        // PASSO 4: Adicionar constraint única composta para prevenir duplicatas
        Schema::table('autarquia_modulo', function (Blueprint $table) {
            $table->unique(['autarquia_id', 'modulo_id'], 'unique_autarquia_modulo');
        });

        // PASSO 5: Recriar os índices necessários
        Schema::table('autarquia_modulo', function (Blueprint $table) {
            // Verificar e criar índices se não existirem
            $indexes = DB::select("
                SELECT indexname
                FROM pg_indexes
                WHERE tablename = 'autarquia_modulo'
            ");

            $indexNames = array_column($indexes, 'indexname');

            if (!in_array('autarquia_modulo_autarquia_id_index', $indexNames)) {
                $table->index('autarquia_id');
            }
            if (!in_array('autarquia_modulo_modulo_id_index', $indexNames)) {
                $table->index('modulo_id');
            }
            if (!in_array('autarquia_modulo_ativo_index', $indexNames)) {
                $table->index('ativo');
            }
            if (!in_array('autarquia_modulo_data_liberacao_index', $indexNames)) {
                $table->index('data_liberacao');
            }
        });

        // PASSO 6: Recriar a foreign key em usuario_modulo_permissao
        // IMPORTANTE: Agora ela vai referenciar as colunas individuais, não a primary key composta
        Schema::table('usuario_modulo_permissao', function (Blueprint $table) {
            // Criar foreign key composta referenciando a UNIQUE constraint
            $table->foreign(['autarquia_id', 'modulo_id'], 'usuario_modulo_permissao_autarquia_modulo_fk')
                  ->references(['autarquia_id', 'modulo_id'])
                  ->on('autarquia_modulo')
                  ->onDelete('restrict')
                  ->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // PASSO 1: Remover foreign key de usuario_modulo_permissao
        Schema::table('usuario_modulo_permissao', function (Blueprint $table) {
            $table->dropForeign('usuario_modulo_permissao_autarquia_modulo_fk');
        });

        // PASSO 2: Remover a constraint única
        Schema::table('autarquia_modulo', function (Blueprint $table) {
            $table->dropUnique('unique_autarquia_modulo');
        });

        // PASSO 3: Remover a coluna id
        Schema::table('autarquia_modulo', function (Blueprint $table) {
            $table->dropColumn('id');
        });

        // PASSO 4: Restaurar a chave primária composta
        Schema::table('autarquia_modulo', function (Blueprint $table) {
            $table->primary(['autarquia_id', 'modulo_id']);
        });

        // PASSO 5: Recriar foreign key original em usuario_modulo_permissao
        Schema::table('usuario_modulo_permissao', function (Blueprint $table) {
            $table->foreign(['autarquia_id', 'modulo_id'])
                  ->references(['autarquia_id', 'modulo_id'])
                  ->on('autarquia_modulo')
                  ->onDelete('restrict')
                  ->onUpdate('cascade');
        });
    }
};
