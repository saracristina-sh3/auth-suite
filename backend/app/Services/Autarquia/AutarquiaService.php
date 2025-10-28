<?php

namespace App\Services\Autarquia;

use App\Models\Autarquia;
use App\Models\AutarquiaModulo;
use App\Models\Modulo;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AutarquiaService
{
    /**
     * Valida e cria uma nova autarquia
     */
    public function createAutarquia(array $data): Autarquia
    {
        $validator = Validator::make($data, [
            'nome' => 'required|string|max:255|unique:autarquias',
            'ativo' => 'boolean',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $validated = $validator->validated();

        $autarquia = Autarquia::create($validated);

        // Criar vínculos automáticos com todos os módulos (inativos)
        $this->createDefaultModuleLinks($autarquia);

        return $autarquia;
    }

    /**
     * Valida e atualiza uma autarquia existente
     */
    public function updateAutarquia(Autarquia $autarquia, array $data): Autarquia
    {
        $validator = Validator::make($data, [
            'nome' => "sometimes|string|max:255|unique:autarquias,nome,{$autarquia->id}",
            'ativo' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        $autarquia->update($validator->validated());

        return $autarquia;
    }

    /**
     * Exclui uma autarquia se não tiver dependências
     */
    public function deleteAutarquia(Autarquia $autarquia): bool
    {
        if ($autarquia->users()->exists()) {
            throw new \Exception('Não é possível excluir a autarquia pois existem usuários vinculados.');
        }

        if ($autarquia->modulos()->exists()) {
            throw new \Exception('Não é possível excluir a autarquia pois existem módulos vinculados.');
        }

        return $autarquia->delete();
    }

    /**
     * Cria vínculos padrão com módulos para uma nova autarquia
     */
    private function createDefaultModuleLinks(Autarquia $autarquia): void
    {
        $modulos = Modulo::all();

        foreach ($modulos as $modulo) {
            AutarquiaModulo::firstOrCreate([
                'autarquia_id' => $autarquia->id,
                'modulo_id' => $modulo->id,
            ], [
                'ativo' => false,
                'data_liberacao' => now(),
            ]);
        }
    }

    /**
     * Obtém estatísticas dos módulos de uma autarquia
     */
    public function getModuleStats(Autarquia $autarquia): array
    {
        return [
            'total' => $autarquia->modulos()->count(),
            'ativos' => $autarquia->modulos()->wherePivot('ativo', true)->count(),
            'inativos' => $autarquia->modulos()->wherePivot('ativo', false)->count(),
        ];
    }

    /**
     * Obtém estatísticas gerais das autarquias
     */
    public function getGlobalStats(): array
    {
        return [
            'total' => Autarquia::count(),
            'ativas' => Autarquia::where('ativo', true)->count(),
            'inativas' => Autarquia::where('ativo', false)->count(),
        ];
    }
}
