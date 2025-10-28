<?php

namespace App\Rules;

use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class UserAutarquiaValidator
{
    /**
     * Valida dados para anexar autarquias
     */
    public function validateAttach(array $data): array
    {
        $validator = Validator::make($data, [
            'autarquia_ids' => 'required|array',
            'autarquia_ids.*' => 'exists:autarquias,id',
            'pivot_data' => 'sometimes|array',
            'pivot_data.role' => 'sometimes|string',
            'pivot_data.is_admin' => 'sometimes|boolean',
            'pivot_data.is_default' => 'sometimes|boolean',
            'pivot_data.ativo' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return $validator->validated();
    }

    /**
     * Valida dados para desanexar autarquias
     */
    public function validateDetach(array $data): array
    {
        $validator = Validator::make($data, [
            'autarquia_ids' => 'required|array',
            'autarquia_ids.*' => 'exists:autarquias,id',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return $validator->validated();
    }

    /**
     * Valida dados para sincronizar autarquias
     */
    public function validateSync(array $data): array
    {
        $validator = Validator::make($data, [
            'autarquias' => 'required|array',
            'autarquias.*.id' => 'required|exists:autarquias,id',
            'autarquias.*.pivot_data' => 'sometimes|array',
            'autarquias.*.pivot_data.role' => 'sometimes|string',
            'autarquias.*.pivot_data.is_admin' => 'sometimes|boolean',
            'autarquias.*.pivot_data.is_default' => 'sometimes|boolean',
            'autarquias.*.pivot_data.ativo' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return $validator->validated();
    }

    /**
     * Valida dados para atualizar autarquia ativa
     */
    public function validateUpdateActive(array $data): array
    {
        $validator = Validator::make($data, [
            'autarquia_ativa_id' => 'required|exists:autarquias,id',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return $validator->validated();
    }
}
