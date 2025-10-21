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
        Schema::create('modulos', function (Blueprint $table) {
            $table->id();
            $table->string('nome', 255)->unique()->notNull();
            $table->text('descricao')->nullable();
            $table->string('icone', 100)->nullable();
            $table->boolean('ativo')->default(true)->notNull();
            $table->timestamps();

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
        Schema::dropIfExists('modulos');
    }
};
