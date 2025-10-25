<?php
namespace App\Services;

use App\Models\Autarquia;
use Illuminate\Support\Facades\Log;

class AutarquiaSessionService
{
    /**
     * Obtém a autarquia ativa da sessão atual
     */
    public function getAutarquiaAtiva(): ?Autarquia
    {
        $autarquiaId = session('autarquia_ativa_id');

        if (!$autarquiaId) {
            return null;
        }

        return Autarquia::find($autarquiaId);
    }

    /**
     * Define a autarquia ativa na sessão
     */
    public function setAutarquiaAtiva(int $autarquiaId, \App\Models\User $user): bool
    {
        // Validar se usuário tem acesso a esta autarquia
        $hasAccess = $user->autarquias()->where('autarquias.id', $autarquiaId)->exists();

        if (!$hasAccess && !$user->is_superadmin) {
            Log::warning('Tentativa de definir autarquia sem acesso', [
                'user_id' => $user->id,
                'autarquia_id' => $autarquiaId
            ]);
            return false;
        }

        // Validar se autarquia existe e está ativa
        $autarquia = Autarquia::find($autarquiaId);

        if (!$autarquia || !$autarquia->ativo) {
            Log::warning('Tentativa de definir autarquia inválida', [
                'user_id' => $user->id,
                'autarquia_id' => $autarquiaId,
                'exists' => $autarquia !== null,
                'ativo' => $autarquia?->ativo
            ]);
            return false;
        }

        // Armazenar na session
        session([
            'autarquia_ativa_id' => $autarquiaId,
            'autarquia_ativa' => [
                'id' => $autarquia->id,
                'nome' => $autarquia->nome,
                'ativo' => $autarquia->ativo
            ]
        ]);

        // Atualizar preferência do usuário (para próxima sessão)
        $user->update(['autarquia_preferida_id' => $autarquiaId]);

        Log::info('Autarquia ativa definida na sessão', [
            'user_id' => $user->id,
            'session_id' => session()->getId(),
            'autarquia_id' => $autarquiaId,
            'autarquia_nome' => $autarquia->nome
        ]);

        return true;
    }

    /**
     * Limpa a autarquia ativa da sessão
     */
    public function clearAutarquiaAtiva(): void
    {
        session()->forget(['autarquia_ativa_id', 'autarquia_ativa']);

        Log::info('Autarquia ativa removida da sessão', [
            'session_id' => session()->getId()
        ]);
    }

    /**
     * Obtém a autarquia ativa ou a preferida como fallback
     */
    public function getAutarquiaAtivaOuPreferida(\App\Models\User $user): ?Autarquia
    {
        // Tentar da session primeiro
        $autarquia = $this->getAutarquiaAtiva();

        if ($autarquia) {
            return $autarquia;
        }

        // Fallback: autarquia preferida do usuário
        if ($user->autarquia_preferida_id) {
            return $user->autarquiaPreferida;
        }

        return null;
    }
}
