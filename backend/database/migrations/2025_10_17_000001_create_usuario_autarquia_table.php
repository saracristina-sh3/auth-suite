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
     * Cria relacionamento N:N entre usuários e autarquias.
     * Um usuário pode estar vinculado a múltiplas autarquias.
     */
    public function up(): void
    {
        // 1. Criar tabela pivot usuario_autarquia
        Schema::create('usuario_autarquia', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('autarquia_id');
            $table->string('role')->default('user'); // Role específica para esta autarquia
            $table->boolean('is_admin')->default(false); // Admin desta autarquia?
            $table->boolean('ativo')->default(true);
            $table->timestamp('data_vinculo')->useCurrent();
            $table->timestamps();

            // Foreign keys
            $table->foreign('user_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');

            $table->foreign('autarquia_id')
                  ->references('id')
                  ->on('autarquias')
                  ->onDelete('cascade');

            // Índices para performance
            $table->index('user_id');
            $table->index('autarquia_id');
            $table->index(['user_id', 'autarquia_id']);

            // Unique: um usuário não pode ter vínculo duplicado com mesma autarquia
            $table->unique(['user_id', 'autarquia_id']);
        });

        // 2. Migrar dados existentes de users.autarquia_id para usuario_autarquia
        // Usar aspas simples para strings no PostgreSQL
        DB::statement("
            INSERT INTO usuario_autarquia (user_id, autarquia_id, role, is_admin, ativo, created_at, updated_at)
            SELECT
                id as user_id,
                autarquia_id,
                role,
                (role = 'clientAdmin') as is_admin,
                is_active as ativo,
                created_at,
                updated_at
            FROM users
            WHERE autarquia_id IS NOT NULL
        ");

        // 3. Adicionar coluna para autarquia ativa (contexto atual do usuário)
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('autarquia_ativa_id')->nullable()->after('autarquia_id');
            $table->foreign('autarquia_ativa_id')
                  ->references('id')
                  ->on('autarquias')
                  ->onDelete('set null');
        });

        // 4. Copiar autarquia_id para autarquia_ativa_id (manter contexto atual)
        DB::statement('UPDATE users SET autarquia_ativa_id = autarquia_id WHERE autarquia_id IS NOT NULL');

        // 5. OPCIONAL: Remover autarquia_id (descomentar quando tiver certeza)
        // Schema::table('users', function (Blueprint $table) {
        //     $table->dropForeign(['autarquia_id']);
        //     $table->dropColumn('autarquia_id');
        // });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Restaurar autarquia_id se foi removida
        // Schema::table('users', function (Blueprint $table) {
        //     $table->unsignedBigInteger('autarquia_id')->nullable();
        //     $table->foreign('autarquia_id')
        //           ->references('id')
        //           ->on('autarquias')
        //           ->onDelete('restrict');
        // });

        // Remover autarquia_ativa_id
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['autarquia_ativa_id']);
            $table->dropColumn('autarquia_ativa_id');
        });

        // Dropar tabela pivot
        Schema::dropIfExists('usuario_autarquia');
    }
};