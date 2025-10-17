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
        Schema::table('users', function (Blueprint $table) {
            // Adiciona a coluna autarquia_ativa_id
            $table->unsignedBigInteger('autarquia_ativa_id')->nullable()->after('id');

            // Cria a chave estrangeira com RESTRICT para evitar exclusão acidental
            $table->foreign('autarquia_ativa_id')
                  ->references('id')
                  ->on('autarquias')
                  ->onDelete('restrict')
                  ->onUpdate('cascade');

            // Índice para otimização de consultas
            $table->index('autarquia_ativa_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['autarquia_ativa_id']);
            $table->dropIndex(['autarquia_ativa_id']);
            $table->dropColumn('autarquia_ativa_id');
        });
    }
};
