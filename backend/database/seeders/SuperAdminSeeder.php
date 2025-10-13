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
        $email = env('SUPERADMIN_EMAIL', 'admin@empresa.com');
        $password = env('SUPERADMIN_PASSWORD', 'admin123');
        $name = env('SUPERADMIN_NAME', 'Super Admin');

        if (!User::where('email', $email)->exists()) {
            User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make($password),
                'is_superadmin' => true,
            ]);

            Log::info("✅ Superusuário criado: {$email}");
        } else {
            Log::info("ℹ️ Superusuário já existe: {$email}");
        }
    }
}
