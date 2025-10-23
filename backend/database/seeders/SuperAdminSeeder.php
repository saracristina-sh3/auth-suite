<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Models\Autarquia;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        // 🔹 Garante a existência da autarquia "SH3 - Suporte"
        $autarquiaSuporte = Autarquia::firstOrCreate(
            ['nome' => 'SH3 - Suporte'],
            ['ativo' => true]
        );

        // 🔹 Lê variáveis do .env (com valores padrão)
        $email = env('SUPERADMIN_EMAIL', 'admin@empresa.com');
        $password = env('SUPERADMIN_PASSWORD', 'admin123');
        $name = env('SUPERADMIN_NAME', 'Super Admin');
        $cpf = env('SUPERADMIN_CPF', '00000000000');

        // 🔹 Verifica se o superadmin já existe (por e-mail OU flag)
        $existingUser = User::where('email', $email)
            ->orWhere('is_superadmin', true)
            ->first();

        if ($existingUser) {
            Log::info("ℹ️ Superusuário já existe: {$email}");
            $this->command->info("ℹ️ Superusuário já existe: {$email}");
            return;
        }

        // 🔹 Cria o superusuário
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

        // 🔹 Cria vínculo na pivot, se ainda não existir
        if (!$superAdmin->autarquias()->where('autarquia_id', $autarquiaSuporte->id)->exists()) {
            $superAdmin->autarquias()->attach($autarquiaSuporte->id, [
                'role' => 'suporteAdmin',
                'is_admin' => true,
                'is_default' => true,
                'ativo' => true,
                'data_vinculo' => now(),
            ]);
        }

        // 🔹 Logs bonitinhos 😄
        Log::info("✅ Autarquia de suporte criada: {$autarquiaSuporte->nome} (ID: {$autarquiaSuporte->id})");
        Log::info("✅ Superusuário criado: {$email}");

        $this->command->info("✅ Autarquia de suporte criada: {$autarquiaSuporte->nome}");
        $this->command->info("✅ Superusuário criado: {$email}");
    }
}
