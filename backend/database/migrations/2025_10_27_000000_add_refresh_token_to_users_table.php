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
            $table->string('refresh_token')->nullable()->after('remember_token');

            $table->timestamp('refresh_token_expires_at')->nullable()->after('refresh_token');

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
