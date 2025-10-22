<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('usuario_modulo_permissao', function (Blueprint $table) {
            // Chaves estrangeiras
            $table->unsignedBigInteger('user_id')->notNull();
            $table->unsignedBigInteger('modulo_id')->notNull();
            $table->unsignedBigInteger('autarquia_id')->notNull();

            // Campos de permissão
            $table->boolean('permissao_leitura')->default(false)->notNull();
            $table->boolean('permissao_escrita')->default(false)->notNull();
            $table->boolean('permissao_exclusao')->default(false)->notNull();
            $table->boolean('permissao_admin')->default(false)->notNull(); // Admin do módulo

            // Campos adicionais
            $table->timestamp('data_concessao')->useCurrent()->notNull();
            $table->boolean('ativo')->default(true)->notNull();
            $table->timestamps(); // created_at, updated_at

            // Chave primária composta
            $table->primary(['user_id', 'modulo_id', 'autarquia_id'], 'usuario_modulo_permissao_pk');

            // Chaves estrangeiras com RESTRICT para evitar exclusão acidental
            $table->foreign('user_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('restrict')
                  ->onUpdate('cascade');

            $table->foreign('modulo_id')
                  ->references('id')
                  ->on('modulos')
                  ->onDelete('restrict')
                  ->onUpdate('cascade');

            $table->foreign('autarquia_id')
                  ->references('id')
                  ->on('autarquias')
                  ->onDelete('restrict')
                  ->onUpdate('cascade');

            // Constraint para garantir que o módulo está liberado para a autarquia
            // Esta verificação garante integridade referencial
            $table->foreign(['autarquia_id', 'modulo_id'])
                  ->references(['autarquia_id', 'modulo_id'])
                  ->on('autarquia_modulo')
                  ->onDelete('restrict')
                  ->onUpdate('cascade');

            // Índices para otimização de consultas
            $table->index('user_id');
            $table->index('modulo_id');
            $table->index('autarquia_id');
            $table->index('ativo');
            $table->index(['user_id', 'ativo']); // Consultas por usuário ativo
            $table->index(['autarquia_id', 'modulo_id']); // Consultas por autarquia e módulo
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usuario_modulo_permissao');
    }
};
