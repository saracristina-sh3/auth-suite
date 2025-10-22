<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\AutarquiaModulo;
use App\Models\Autarquia;
use App\Models\Modulo;

class AutarquiaModuloMigrationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Testa se a tabela tem a estrutura correta após a migration
     */
    public function test_table_has_correct_structure(): void
    {
        // Verificar se a coluna id existe
        $this->assertTrue(
            Schema::hasColumn('autarquia_modulo', 'id'),
            'Tabela autarquia_modulo deve ter coluna id'
        );

        // Verificar se outras colunas existem
        $columns = ['autarquia_id', 'modulo_id', 'data_liberacao', 'ativo', 'created_at', 'updated_at'];
        foreach ($columns as $column) {
            $this->assertTrue(
                Schema::hasColumn('autarquia_modulo', $column),
                "Tabela autarquia_modulo deve ter coluna {$column}"
            );
        }
    }

    /**
     * Testa se updateOrCreate funciona corretamente
     */
    public function test_update_or_create_works(): void
    {
        // Criar autarquia e módulo de teste
        $autarquia = Autarquia::factory()->create();
        $modulo = Modulo::factory()->create();

        // Criar registro usando updateOrCreate
        $liberacao = AutarquiaModulo::updateOrCreate(
            [
                'autarquia_id' => $autarquia->id,
                'modulo_id' => $modulo->id,
            ],
            [
                'ativo' => true,
                'data_liberacao' => now(),
            ]
        );

        // Verificar se foi criado
        $this->assertNotNull($liberacao->id);
        $this->assertEquals($autarquia->id, $liberacao->autarquia_id);
        $this->assertEquals($modulo->id, $liberacao->modulo_id);
        $this->assertTrue($liberacao->ativo);
        $this->assertNotNull($liberacao->data_liberacao);

        // Atualizar o mesmo registro
        $liberacaoAtualizada = AutarquiaModulo::updateOrCreate(
            [
                'autarquia_id' => $autarquia->id,
                'modulo_id' => $modulo->id,
            ],
            [
                'ativo' => false,
                'data_liberacao' => null,
            ]
        );

        // Verificar se é o mesmo registro (mesmo ID)
        $this->assertEquals($liberacao->id, $liberacaoAtualizada->id);
        $this->assertFalse($liberacaoAtualizada->ativo);
        $this->assertNull($liberacaoAtualizada->data_liberacao);

        // Verificar que não há duplicatas
        $count = AutarquiaModulo::where('autarquia_id', $autarquia->id)
            ->where('modulo_id', $modulo->id)
            ->count();
        $this->assertEquals(1, $count);
    }

    /**
     * Testa se a constraint única funciona
     */
    public function test_unique_constraint_prevents_duplicates(): void
    {
        $autarquia = Autarquia::factory()->create();
        $modulo = Modulo::factory()->create();

        // Criar primeiro registro
        AutarquiaModulo::create([
            'autarquia_id' => $autarquia->id,
            'modulo_id' => $modulo->id,
            'ativo' => true,
            'data_liberacao' => now(),
        ]);

        // Tentar criar duplicata deve falhar
        $this->expectException(\Illuminate\Database\QueryException::class);

        AutarquiaModulo::create([
            'autarquia_id' => $autarquia->id,
            'modulo_id' => $modulo->id,
            'ativo' => false,
        ]);
    }

    /**
     * Testa se as relações funcionam
     */
    public function test_relationships_work(): void
    {
        $autarquia = Autarquia::factory()->create(['nome' => 'Autarquia Teste']);
        $modulo = Modulo::factory()->create(['nome' => 'Módulo Teste']);

        $liberacao = AutarquiaModulo::create([
            'autarquia_id' => $autarquia->id,
            'modulo_id' => $modulo->id,
            'ativo' => true,
            'data_liberacao' => now(),
        ]);

        // Testar relação com autarquia
        $this->assertInstanceOf(Autarquia::class, $liberacao->autarquia);
        $this->assertEquals('Autarquia Teste', $liberacao->autarquia->nome);

        // Testar relação com módulo
        $this->assertInstanceOf(Modulo::class, $liberacao->modulo);
        $this->assertEquals('Módulo Teste', $liberacao->modulo->nome);
    }

    /**
     * Testa se os scopes funcionam
     */
    public function test_scopes_work(): void
    {
        $autarquia1 = Autarquia::factory()->create();
        $autarquia2 = Autarquia::factory()->create();
        $modulo = Modulo::factory()->create();

        AutarquiaModulo::create([
            'autarquia_id' => $autarquia1->id,
            'modulo_id' => $modulo->id,
            'ativo' => true,
            'data_liberacao' => now(),
        ]);

        AutarquiaModulo::create([
            'autarquia_id' => $autarquia2->id,
            'modulo_id' => $modulo->id,
            'ativo' => false,
        ]);

        // Testar scope byAutarquia
        $liberacoesAutarquia1 = AutarquiaModulo::byAutarquia($autarquia1->id)->get();
        $this->assertEquals(1, $liberacoesAutarquia1->count());

        // Testar scope ativas
        $ativas = AutarquiaModulo::ativas()->get();
        $this->assertEquals(1, $ativas->count());
        $this->assertTrue($ativas->first()->ativo);
    }

    /**
     * Testa operações em massa (bulk)
     */
    public function test_bulk_operations(): void
    {
        $autarquia = Autarquia::factory()->create();
        $modulos = Modulo::factory()->count(5)->create();

        // Criar múltiplos registros
        foreach ($modulos as $modulo) {
            AutarquiaModulo::updateOrCreate(
                [
                    'autarquia_id' => $autarquia->id,
                    'modulo_id' => $modulo->id,
                ],
                [
                    'ativo' => true,
                    'data_liberacao' => now(),
                ]
            );
        }

        // Verificar que todos foram criados
        $count = AutarquiaModulo::byAutarquia($autarquia->id)->count();
        $this->assertEquals(5, $count);

        // Atualizar todos para inativo
        foreach ($modulos as $modulo) {
            AutarquiaModulo::updateOrCreate(
                [
                    'autarquia_id' => $autarquia->id,
                    'modulo_id' => $modulo->id,
                ],
                [
                    'ativo' => false,
                    'data_liberacao' => null,
                ]
            );
        }

        // Verificar que nenhum está ativo
        $ativas = AutarquiaModulo::byAutarquia($autarquia->id)->ativas()->count();
        $this->assertEquals(0, $ativas);
    }
}
