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
        Schema::create('autarquia_modulo', function (Blueprint $table) {
            // Chaves estrangeiras
            $table->unsignedBigInteger('autarquia_id')->notNull();
            $table->unsignedBigInteger('modulo_id')->notNull();

            // Campos adicionais
            $table->timestamp('data_liberacao')->useCurrent()->notNull();
            $table->boolean('ativo')->default(true)->notNull();
            $table->timestamps(); // created_at, updated_at

            // Chave primária composta
            $table->primary(['autarquia_id', 'modulo_id']);

            // Chaves estrangeiras com RESTRICT para evitar exclusão acidental
            $table->foreign('autarquia_id')
                  ->references('id')
                  ->on('autarquias')
                  ->onDelete('restrict')
                  ->onUpdate('cascade');

            $table->foreign('modulo_id')
                  ->references('id')
                  ->on('modulos')
                  ->onDelete('restrict')
                  ->onUpdate('cascade');

            // Índices para otimização de consultas
            $table->index('autarquia_id');
            $table->index('modulo_id');
            $table->index('ativo');
            $table->index('data_liberacao');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('autarquia_modulo');
    }
};
