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
            $table->renameColumn('autarquia_ativa_id', 'autarquia_preferida_id');
        });

        // Atualizar comentário
        DB::statement(
            "COMMENT ON COLUMN users.autarquia_preferida_id IS
            'Última autarquia usada pelo usuário (preferência).
            A autarquia ativa da sessão atual está em session(autarquia_ativa_id)'"
        );
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('autarquia_preferida_id', 'autarquia_ativa_id');
        });
    }
};
