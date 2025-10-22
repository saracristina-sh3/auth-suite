<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seeders de produção (sempre executados)
        $this->call(ModulosSeeder::class);        // Módulos fixos do sistema
        $this->call(SuperAdminSeeder::class);     // Usuário superadmin SH3

        // Seeders de desenvolvimento/teste (opcional)
        $this->call(ControlePorAutarquiaSeeder::class);
    }
}
