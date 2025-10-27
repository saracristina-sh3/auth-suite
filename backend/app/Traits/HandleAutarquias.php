<?php

namespace App\Traits;

use App\Services\AutarquiaSessionService;

trait HandleAutarquias
{
    public function getAutarquiaAtivaId(): ?int
    {
        return session('autarquia_ativa_id');
    }

    public function trocarAutarquia(int $autarquiaId): bool
    {
        $service = app(AutarquiaSessionService::class);
        return $service->setAutarquiaAtiva($autarquiaId, $this);
    }

    public function isAdminDaAutarquia(?int $autarquiaId = null): bool
    {
        if ($this->is_superadmin) {
            return false;
        }

        $autarquiaId ??= $this->getAutarquiaAtivaId();

        return $this->autarquias()
            ->where('autarquia_id', $autarquiaId)
            ->wherePivot('is_admin', true)
            ->wherePivot('ativo', true)
            ->exists();
    }
}
