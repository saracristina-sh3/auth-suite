<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use App\Models\User;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        // Criar autarquia SH3 para usuários de suporte
        $autarquiaSuporte = \App\Models\Autarquia::firstOrCreate(
            ['nome' => 'SH3 - Suporte'],
            ['ativo' => true]
        );

        $email = env('SUPERADMIN_EMAIL', 'admin@empresa.com');
        $password = env('SUPERADMIN_PASSWORD', 'admin123');
        $name = env('SUPERADMIN_NAME', 'Super Admin');
        $cpf = env('SUPERADMIN_CPF', '00000000000');

        if (!User::where('email', $email)->exists()) {
            $superAdmin = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make($password),
                'cpf' => $cpf,
                'role' => 'superadmin',
                'autarquia_ativa_id' => $autarquiaSuporte->id,
                'is_active' => true,
                'is_superadmin' => true,
            ]);

            // Criar vínculo na tabela pivot usuario_autarquia
            $superAdmin->autarquias()->attach($autarquiaSuporte->id, [
                'role' => 'suporteAdmin',
                'is_admin' => true,
                'is_default' => true,
                'ativo' => true,
                'data_vinculo' => now(),
            ]);

            Log::info("✅ Autarquia de suporte criada: SH3 - Suporte (ID: {$autarquiaSuporte->id})");
            Log::info("✅ Superusuário criado: {$email}");
            $this->command->info("✅ Autarquia de suporte criada: SH3 - Suporte");
            $this->command->info("✅ Superusuário criado: {$email}");
        } else {
            Log::info("ℹ️ Superusuário já existe: {$email}");
            $this->command->info("ℹ️ Superusuário já existe: {$email}");
        }
    }
}
