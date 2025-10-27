<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adiciona campos para gerenciar refresh tokens
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Campo para armazenar o hash do refresh token
            $table->string('refresh_token')->nullable()->after('remember_token');

            // Campo para armazenar a data de expiração do refresh token
            $table->timestamp('refresh_token_expires_at')->nullable()->after('refresh_token');

            // Índice para busca por refresh token
            $table->index('refresh_token_expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['refresh_token_expires_at']);
            $table->dropColumn(['refresh_token', 'refresh_token_expires_at']);
        });
    }
};
