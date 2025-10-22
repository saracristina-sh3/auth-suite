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
        Schema::create('autarquias', function (Blueprint $table) {
            $table->id(); // Equivalente a SERIAL (auto-incremento)
            $table->string('nome', 255)->unique()->notNull();
            $table->boolean('ativo')->default(true)->notNull();
            $table->timestamps(); // created_at, updated_at

            // Índices para otimização
            $table->index('nome');
            $table->index('ativo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('autarquias');
    }
};
