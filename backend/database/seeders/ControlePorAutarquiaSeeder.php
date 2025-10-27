<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ControlePorAutarquiaSeeder extends Seeder
{
    /**
     * Seed de dados para o sistema de controle de acesso granular
     * Baseado no cenário: Autarquias X, Y, Z com Módulos A, B, C, D
     * e Usuários João, Maria, Pedro, Ana, Carlos
     */
    public function run(): void
    {
        // ========================================
        // 1. CRIAÇÃO DE AUTARQUIAS
        // ========================================
        // Nota: A autarquia ID 1 (SH3 - Suporte) é criada automaticamente pelo SuperAdminSeeder
        $autarquias = [
            ['nome' => 'Prefeitura Municipal X', 'ativo' => true],
            ['nome' => 'Prefeitura Municipal Y', 'ativo' => true],
            ['nome' => 'Prefeitura Municipal Z', 'ativo' => true],
        ];

        $autarquiaIds = [];
        foreach ($autarquias as $autarquiaData) {
            $id = DB::table('autarquias')->insertGetId([
                'nome' => $autarquiaData['nome'],
                'ativo' => $autarquiaData['ativo'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $autarquiaIds[] = $id;
        }

        // ========================================
        // 2. MÓDULOS
        // ========================================
        // NOTA: Os módulos são criados pelo ModulosSeeder (seeders de produção)
        // Este seeder apenas referencia os IDs existentes: 1, 2, 3, 4

        // ========================================
        // 3. CRIAÇÃO DE USUÁRIOS
        // ========================================
        // Cenário:
        // - João: Autarquia X, gestor de frota
        // - Maria: Autarquia X, RH
        // - Pedro: Autarquia Y, gestor de frota e almoxarifado
        // - Ana: Autarquia Y, contabilidade
        // - Carlos: Autarquia Z, administrador geral

        $usuarios = [
            [
                'name' => 'Teste User',
                'email' => 'teste@empresa.com',
                'cpf' => '02790912068',
                'password' => Hash::make('senha123'),
                'autarquia_preferida_id' => $autarquiaIds[0], // Prefeitura X
                'role' => 'gestor',
                'is_active' => true,
            ],
            [
                'name' => 'João Silva',
                'email' => 'joao.silva@prefeiturax.gov.br',
                'cpf' => '18777621050',
                'password' => Hash::make('senha123'),
                'autarquia_preferida_id' => $autarquiaIds[0], // Prefeitura X
                'role' => 'gestor',
                'is_active' => true,
            ],
            [
                'name' => 'Maria Oliveira',
                'email' => 'maria.oliveira@prefeiturax.gov.br',
                'cpf' => '21025819004',
                'password' => Hash::make('senha123'),
                'autarquia_preferida_id' => $autarquiaIds[0], // Prefeitura X
                'role' => 'gestor',
                'is_active' => true,
            ],
            [
                'name' => 'Pedro Santos',
                'email' => 'pedro.santos@prefeituray.gov.br',
                'cpf' => '10219053057',
                'password' => Hash::make('senha123'),
                'autarquia_preferida_id' => $autarquiaIds[1], // Prefeitura Y
                'role' => 'gestor',
                'is_active' => true,
            ],
            [
                'name' => 'Ana Costa',
                'email' => 'ana.costa@prefeituray.gov.br',
                'cpf' => '4567853243990009901234',
                'password' => Hash::make('senha123'),
                'autarquia_preferida_id' => $autarquiaIds[1], // Prefeitura Y
                'role' => 'user',
                'is_active' => true,
            ],
            [
                'name' => 'Carlos Ferreira',
                'email' => 'carlos.ferreira@prefeituraz.gov.br',
                'cpf' => '39946586088',
                'password' => Hash::make('senha123'),
                'autarquia_preferida_id' => $autarquiaIds[2], // Prefeitura Z
                'role' => 'admin',
                'is_active' => true,
            ],
        ];

        $usuarioIds = [];
        foreach ($usuarios as $usuarioData) {

            $user = \App\Models\User::create([
                'name' => $usuarioData['name'],
                'email' => $usuarioData['email'],
                'cpf' => $usuarioData['cpf'],
                'password' => $usuarioData['password'],
                'role' => $usuarioData['role'],
                'autarquia_preferida_id' => $usuarioData['autarquia_preferida_id'],
                'is_active' => $usuarioData['is_active'],
                'is_superadmin' => false,
            ]);

            $user->autarquias()->attach($usuarioData['autarquia_preferida_id'], [
                'role' => $usuarioData['role'],
                'is_admin' => $usuarioData['role'] === 'admin',
                'is_default' => true,
                'ativo' => true,
                'data_vinculo' => now(),
            ]);

            $usuarioIds[] = $user->id;
        }

        // ========================================
        // 4. LIBERAÇÃO DE MÓDULOS PARA AUTARQUIAS
        // ========================================
        // Cenário:
        // - Autarquia X: Tem acesso aos módulos Gestão de Frota, RH e Almoxarifado
        // - Autarquia Y: Tem acesso a todos os módulos
        // - Autarquia Z: Tem acesso aos módulos Gestão de Frota e Contabilidade

        $autarquiaModulos = [
            // Autarquia X
            ['autarquia_id' => $autarquiaIds[0], 'modulo_id' => 1], // Gestão de Frota
            ['autarquia_id' => $autarquiaIds[0], 'modulo_id' => 2], // RH
            ['autarquia_id' => $autarquiaIds[0], 'modulo_id' => 3], // Almoxarifado

            // Autarquia Y - Todos os módulos
            ['autarquia_id' => $autarquiaIds[1], 'modulo_id' => 1], // Gestão de Frota
            ['autarquia_id' => $autarquiaIds[1], 'modulo_id' => 2], // RH
            ['autarquia_id' => $autarquiaIds[1], 'modulo_id' => 3], // Almoxarifado
            ['autarquia_id' => $autarquiaIds[1], 'modulo_id' => 4], // Contabilidade

            // Autarquia Z
            ['autarquia_id' => $autarquiaIds[2], 'modulo_id' => 1], // Gestão de Frota
            ['autarquia_id' => $autarquiaIds[2], 'modulo_id' => 4], // Contabilidade
        ];

        foreach ($autarquiaModulos as $am) {
            DB::table('autarquia_modulo')->insert([
                'autarquia_id' => $am['autarquia_id'],
                'modulo_id' => $am['modulo_id'],
                'data_liberacao' => now(),
                'ativo' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // ========================================
        // 5. PERMISSÕES DE USUÁRIOS NOS MÓDULOS
        // ========================================
        // Cenário:
        // - João (Autarquia X): Admin de Gestão de Frota
        // - Maria (Autarquia X): Admin de RH
        // - Pedro (Autarquia Y): Admin de Gestão de Frota e Almoxarifado
        // - Ana (Autarquia Y): Leitura e Escrita em Contabilidade
        // - Carlos (Autarquia Z): Admin de todos os módulos da sua autarquia

        $permissoes = [
            // João - Gestão de Frota (Autarquia X)
            [
                'user_id' => $usuarioIds[0],
                'modulo_id' => 1,
                'autarquia_id' => $autarquiaIds[0],
                'permissao_leitura' => true,
                'permissao_escrita' => true,
                'permissao_exclusao' => true,
                'permissao_admin' => true,
            ],

            // Maria - RH (Autarquia X)
            [
                'user_id' => $usuarioIds[1],
                'modulo_id' => 2,
                'autarquia_id' => $autarquiaIds[0],
                'permissao_leitura' => true,
                'permissao_escrita' => true,
                'permissao_exclusao' => true,
                'permissao_admin' => true,
            ],

            // Pedro - Gestão de Frota (Autarquia Y)
            [
                'user_id' => $usuarioIds[2],
                'modulo_id' => 1,
                'autarquia_id' => $autarquiaIds[1],
                'permissao_leitura' => true,
                'permissao_escrita' => true,
                'permissao_exclusao' => true,
                'permissao_admin' => true,
            ],

            // Pedro - Almoxarifado (Autarquia Y)
            [
                'user_id' => $usuarioIds[2],
                'modulo_id' => 3,
                'autarquia_id' => $autarquiaIds[1],
                'permissao_leitura' => true,
                'permissao_escrita' => true,
                'permissao_exclusao' => true,
                'permissao_admin' => true,
            ],

            // Ana - Contabilidade (Autarquia Y)
            [
                'user_id' => $usuarioIds[3],
                'modulo_id' => 4,
                'autarquia_id' => $autarquiaIds[1],
                'permissao_leitura' => true,
                'permissao_escrita' => true,
                'permissao_exclusao' => false,
                'permissao_admin' => false,
            ],

            // Carlos - Gestão de Frota (Autarquia Z)
            [
                'user_id' => $usuarioIds[4],
                'modulo_id' => 1,
                'autarquia_id' => $autarquiaIds[2],
                'permissao_leitura' => true,
                'permissao_escrita' => true,
                'permissao_exclusao' => true,
                'permissao_admin' => true,
            ],

            // Carlos - Contabilidade (Autarquia Z)
            [
                'user_id' => $usuarioIds[4],
                'modulo_id' => 4,
                'autarquia_id' => $autarquiaIds[2],
                'permissao_leitura' => true,
                'permissao_escrita' => true,
                'permissao_exclusao' => true,
                'permissao_admin' => true,
            ],
        ];

        foreach ($permissoes as $permissao) {
            DB::table('usuario_modulo_permissao')->insert([
                'user_id' => $permissao['user_id'],
                'modulo_id' => $permissao['modulo_id'],
                'autarquia_id' => $permissao['autarquia_id'],
                'permissao_leitura' => $permissao['permissao_leitura'],
                'permissao_escrita' => $permissao['permissao_escrita'],
                'permissao_exclusao' => $permissao['permissao_exclusao'],
                'permissao_admin' => $permissao['permissao_admin'],
                'data_concessao' => now(),
                'ativo' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('✅ Dados de teste criados com sucesso!');
        $this->command->info('');
        $this->command->info('📊 Resumo:');
        $this->command->info('   - 3 Autarquias de teste (X, Y, Z)');
        $this->command->info('   - 5 Usuários de teste (João, Maria, Pedro, Ana, Carlos)');
        $this->command->info('   - 9 Liberações de módulos para autarquias');
        $this->command->info('   - 7 Permissões de usuários configuradas');
        $this->command->info('');
        $this->command->info('ℹ️  Os módulos do sistema são gerenciados pelo ModulosSeeder');
        $this->command->info('');
        $this->command->info('🔑 Credenciais de acesso:');
        $this->command->info('   Email: joao.silva@prefeiturax.gov.br | Senha: senha123');
        $this->command->info('   Email: maria.oliveira@prefeiturax.gov.br | Senha: senha123');
        $this->command->info('   Email: pedro.santos@prefeituray.gov.br | Senha: senha123');
        $this->command->info('   Email: ana.costa@prefeituray.gov.br | Senha: senha123');
        $this->command->info('   Email: carlos.ferreira@prefeituraz.gov.br | Senha: senha123');
    }
}
