<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Regra de validação para CPF brasileiro
 *
 * Valida se um CPF é válido de acordo com as regras da Receita Federal
 * Aceita CPF com ou sem formatação (pontos e hífen)
 *
 * @example
 * ```php
 * 'cpf' => ['required', new CpfValidation]
 * ```
 */
class CpfValidation implements ValidationRule
{
    /**
     * Executa a validação
     *
     * @param  string  $attribute
     * @param  mixed  $value
     * @param  \Closure  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!$this->isValidCpf($value)) {
            $fail('O :attribute informado não é válido.');
        }
    }

    /**
     * Valida um CPF brasileiro
     *
     * @param  string|null  $cpf
     * @return bool
     */
    private function isValidCpf(?string $cpf): bool
    {
        if (empty($cpf)) {
            return false;
        }

        // Remove caracteres não numéricos
        $cpf = preg_replace('/\D/', '', $cpf);

        // CPF deve ter 11 dígitos
        if (strlen($cpf) !== 11) {
            return false;
        }

        // Verifica se todos os dígitos são iguais (CPF inválido)
        if (preg_match('/^(\d)\1{10}$/', $cpf)) {
            return false;
        }

        // Valida primeiro dígito verificador
        $sum = 0;
        for ($i = 0; $i < 9; $i++) {
            $sum += (int) $cpf[$i] * (10 - $i);
        }
        $remainder = 11 - ($sum % 11);
        $digit1 = $remainder >= 10 ? 0 : $remainder;

        if ($digit1 !== (int) $cpf[9]) {
            return false;
        }

        // Valida segundo dígito verificador
        $sum = 0;
        for ($i = 0; $i < 10; $i++) {
            $sum += (int) $cpf[$i] * (11 - $i);
        }
        $remainder = 11 - ($sum % 11);
        $digit2 = $remainder >= 10 ? 0 : $remainder;

        if ($digit2 !== (int) $cpf[10]) {
            return false;
        }

        return true;
    }
}
