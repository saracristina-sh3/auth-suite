<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ModulosSeeder extends Seeder
{
    /**
     * Seed dos módulos fixos do sistema
     *
     * IMPORTANTE: Estes módulos são permanentes e não devem ser criados/deletados via interface.
     * Apenas o status 'ativo' pode ser alterado pelos administradores.
     *
     * Para adicionar novos módulos ao sistema:
     * 1. Adicione-os neste array
     * 2. Execute: php artisan db:seed --class=ModulosSeeder
     *
     * Estrutura de Controle:
     * - modulos.ativo = Módulo disponível no sistema (global)
     * - autarquia_modulo.ativo = Autarquia tem acesso (contrato/plano)
     * - usuario_modulo_permissao = Permissões granulares por usuário
     */
    public function run(): void
    {
        $modulos = [
            [
                'id' => 1,
                'nome' => 'Gestão de Frota',
                'descricao' => 'Módulo para controle e gestão da frota de veículos municipais',
                'icone' => 'frota_button',
                'ativo' => true
            ],
            [
                'id' => 2,
                'nome' => 'Departamento Pessoal',
                'descricao' => 'Módulo para gestão de funcionários, folha de pagamento e benefícios',
                'icone' => 'departamento_pessoal_button',
                'ativo' => true
            ],
            [
                'id' => 3,
                'nome' => 'Almoxarifado',
                'descricao' => 'Módulo para controle de estoque e requisições de materiais',
                'icone' => 'almoxarifado_button',
                'ativo' => true
            ],
            [
                'id' => 4,
                'nome' => 'Contabilidade',
                'descricao' => 'Módulo para controle financeiro, empenhos e prestação de contas',
                'icone' => 'contabilidade_button',
                'ativo' => true
            ],
            [
                'id' => 5,
                'nome' => 'Compras',
                'descricao' => 'Sistema de compras e licitações',
                'icone' => 'compras_button',
                'ativo' => true
            ],
            [
                'id' => 6,
                'nome' => 'Patrimônio',
                'descricao' => 'Gestão de bens e inventário patrimonial',
                'icone' => 'patrimonio_button',
                'ativo' => true
            ],
            [
                'id' => 7,
                'nome' => 'Orçamento',
                'descricao' => 'Planejamento orçamentário de entidades públicas',
                'icone' => 'orcamento_button',
                'ativo' => true
            ],
            [
                'id' => 8,
                'nome' => 'Tesouraria',
                'descricao' => 'Controle de caixa e movimentações financeiras',
                'icone' => 'tesouraria_button',
                'ativo' => true
            ],
            [
                'id' => 9,
                'nome' => 'Requisição Interna',
                'descricao' => 'Controle de requisições internas entre departamentos',
                'icone' => 'requisicao_interna_button',
                'ativo' => true
            ],
            [
                'id' => 10,
                'nome' => 'Diárias',
                'descricao' => 'Controle de diárias e viagens a serviço',
                'icone' => 'diarias_button',
                'ativo' => true
            ],
            [
                'id' => 11,
                'nome' => 'Controle Interno',
                'descricao' => 'Controle e auditoria de processos internos',
                'icone' => 'controle_interno_button',
                'ativo' => true
            ],
        ];

        foreach ($modulos as $modulo) {
            // Usar updateOrInsert para evitar duplicatas
            DB::table('modulos')->updateOrInsert(
                ['id' => $modulo['id']], // Condição de busca
                [
                    'nome' => $modulo['nome'],
                    'descricao' => $modulo['descricao'],
                    'icone' => $modulo['icone'],
                    'ativo' => $modulo['ativo'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        $this->command->info('✅ Módulos fixos do sistema criados/atualizados com sucesso!');
        $this->command->info('');
        $this->command->info('📦 Módulos disponíveis (' . count($modulos) . '):');
        foreach ($modulos as $modulo) {
            $this->command->info('   ' . $modulo['id'] . '. ' . $modulo['nome']);
        }
        $this->command->info('');
        $this->command->info('💡 Para gerenciar módulos por autarquia, use a interface AdminManagementView > Liberações');
    }
}
