<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Services\AutarquiaSessionService;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

   protected $fillable = [
    'name',
    'email',
    'password',
    'role',
    'cpf',
    'autarquia_preferida_id',
    'is_active',
    'is_superadmin',
    'refresh_token',
    'refresh_token_expires_at',
];

    protected $hidden = [
        'password',
        'remember_token',
        'refresh_token',
    ];

    protected function casts(): array
{
    return [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
        'is_superadmin' => 'boolean',
        'autarquia_preferida_id' => 'integer',
        'refresh_token_expires_at' => 'datetime',
    ];
}

    /**
     * Relacionamento: Usuário pode estar vinculado a múltiplas autarquias (N:N)
     */
    public function autarquias(): BelongsToMany
    {
        return $this->belongsToMany(Autarquia::class, 'usuario_autarquia')
            ->withPivot('role', 'is_admin', 'is_default', 'ativo', 'data_vinculo')
            ->withTimestamps();
    }

    /**
     * Relacionamento: Autarquia ativa no contexto atual
     */
    public function autarquiaPreferida()
{
    return $this->belongsTo(Autarquia::class, 'autarquia_preferida_id');
}

    // Helper para autarquia ativa (da session)
public function getAutarquiaPreferidaAttribute()
{
    $autarquiaId = session('autarquia_preferida_id');

    if (!$autarquiaId) {
        return null;
    }

    return Autarquia::find($autarquiaId);
}

    /**
     * Relacionamento: Usuário possui muitas permissões em módulos
     */
    public function permissoes(): HasMany
    {
        return $this->hasMany(UsuarioModuloPermissao::class, 'user_id');
    }

    /**
     * Relacionamento: Usuário possui muitas permissões ativas
     */
    public function permissoesAtivas(): HasMany
    {
        return $this->permissoes()->where('ativo', true);
    }

    /**
     * Relacionamento: Módulos que o usuário tem acesso
     */
    public function modulos(): BelongsToMany
    {
        return $this->belongsToMany(Modulo::class, 'usuario_modulo_permissao', 'user_id', 'modulo_id')
            ->withPivot('autarquia_id', 'permissao_leitura', 'permissao_escrita', 'permissao_exclusao', 'permissao_admin', 'data_concessao', 'ativo')
            ->withTimestamps();
    }

    // Métodos de autorização
    public function isAdmin(): bool
    {
        // Apenas superadmin SH3 é considerado admin global
        return $this->is_superadmin;
    }

    public function isManager(): bool
    {
        return $this->role === 'clientAdmin' ;
    }

    public function canAccess(string $permission): bool
    {
        // Lógica de permissões específicas
        return $this->is_active && (
            $this->is_superadmin ||
            in_array($permission, $this->getPermissions())
        );
    }

    protected function getPermissions(): array
    {
        // Definir permissões baseadas no role
        $permissions = [
            'user' => ['view_dashboard'],
            'clientAdmin' => ['view_dashboard', 'manage_users', 'view_reports'],
            'suporteAdmin' => ['view_dashboard', 'manage_users', 'manage_system', 'view_reports']
        ];

        return $permissions[$this->role] ?? [];
    }

    /**
     * Verifica se o usuário tem permissão de leitura no módulo
     */
    public function podeLerModulo(int $moduloId, ?int $autarquiaId = null): bool
    {
        if ($this->is_superadmin) {
            return true;
        }

        $autarquiaId = $autarquiaId ?? session('autarquia_ativa_id');

        return $this->permissoesAtivas()
            ->where('modulo_id', $moduloId)
            ->where('autarquia_id', $autarquiaId)
            ->where('permissao_leitura', true)
            ->exists();
    }

    /**
     * Verifica se o usuário tem permissão de escrita no módulo
     */
    public function podeEscreverModulo(int $moduloId, ?int $autarquiaId = null): bool
    {
        if ($this->is_superadmin) {
            return true;
        }

        $autarquiaId = $autarquiaId ?? session('autarquia_ativa_id');

        return $this->permissoesAtivas()
            ->where('modulo_id', $moduloId)
            ->where('autarquia_id', $autarquiaId)
            ->where('permissao_escrita', true)
            ->exists();
    }

    /**
     * Verifica se o usuário tem permissão de exclusão no módulo
     */
    public function podeExcluirModulo(int $moduloId, ?int $autarquiaId = null): bool
    {
        if ($this->is_superadmin) {
            return true;
        }

        $autarquiaId = $autarquiaId ?? session('autarquia_ativa_id');

        return $this->permissoesAtivas()
            ->where('modulo_id', $moduloId)
            ->where('autarquia_id', $autarquiaId)
            ->where('permissao_exclusao', true)
            ->exists();
    }

    /**
     * Verifica se o usuário é admin do módulo
     */
    public function eAdminModulo(int $moduloId, ?int $autarquiaId = null): bool
    {
        if ($this->is_superadmin) {
            return true;
        }

        $autarquiaId = $autarquiaId ?? session('autarquia_ativa_id');

        return $this->permissoesAtivas()
            ->where('modulo_id', $moduloId)
            ->where('autarquia_id', $autarquiaId)
            ->where('permissao_admin', true)
            ->exists();
    }

    /**
     * Retorna todos os módulos que o usuário tem acesso
     */
    public function getModulosDisponiveis(?int $autarquiaId = null)
    {
        if ($this->is_superadmin) {
            return Modulo::ativos()->get();
        }

        $autarquiaId = $autarquiaId ?? session('autarquia_ativa_id');

        return $this->modulos()
            ->wherePivot('autarquia_id', $autarquiaId)
            ->wherePivot('ativo', true)
            ->get();
    }

    /**
     * Verifica se o usuário é admin de uma autarquia específica
     * (Não confundir com superadmin SH3 - isto é para admin de autarquia)
     */
    public function isAdminDaAutarquia(?int $autarquiaId = null): bool
    {
        // Superadmin SH3 tem acesso total mas não usa esta função
        if ($this->is_superadmin) {
            return false;
        }

        $autarquiaId ??= session('autarquia_ativa_id');

        return $this->autarquias()
            ->where('autarquia_id', $autarquiaId)
            ->wherePivot('is_admin', true)
            ->wherePivot('ativo', true)
            ->exists();
    }

    /**
     * Troca o contexto de autarquia ativa
     */
public function trocarAutarquia(int $autarquiaId): bool
{
    // Usar o service ao invés de salvar no BD
    $service = app(AutarquiaSessionService::class);
    return $service->setAutarquiaAtiva($autarquiaId, $this);
}

    /**
     * Retorna o role do usuário para uma autarquia específica
     */
    public function getRoleParaAutarquia(?int $autarquiaId = null): string
    {
        // Superadmin SH3 sempre tem role de suporte
        if ($this->is_superadmin) {
            return 'suporteAdmin';
        }

        $autarquiaId ??= session('autarquia_ativa_id');

        $pivot = $this->autarquias()
            ->where('autarquia_id', $autarquiaId)
            ->wherePivot('ativo', true)
            ->first()?->pivot;

        return $pivot?->role ?? $this->role;
    }
}
