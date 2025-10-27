<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Services\PermissionService;
use App\Traits\HandleAutarquias;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HandleAutarquias;

    protected $fillable = [
        'name', 'email', 'password', 'role', 'cpf',
        'autarquia_preferida_id', 'is_active', 'is_superadmin',
        'refresh_token', 'refresh_token_expires_at'
    ];

    protected $hidden = [
        'password', 'remember_token', 'refresh_token'
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

    // Relacionamentos
    public function autarquias(): BelongsToMany
    {
        return $this->belongsToMany(Autarquia::class, 'usuario_autarquia')
            ->withPivot('role', 'is_admin', 'is_default', 'ativo', 'data_vinculo')
            ->withTimestamps();
    }

    public function autarquiaPreferida(): BelongsTo
    {
        return $this->belongsTo(Autarquia::class, 'autarquia_preferida_id');
    }

    public function permissoes(): HasMany
    {
        return $this->hasMany(UsuarioModuloPermissao::class, 'user_id');
    }

    public function permissoesAtivas(): HasMany
    {
        return $this->permissoes()->where('ativo', true);
    }

    public function modulos(): BelongsToMany
    {
        return $this->belongsToMany(Modulo::class, 'usuario_modulo_permissao', 'user_id', 'modulo_id')
            ->withPivot('autarquia_id', 'permissao_leitura', 'permissao_escrita', 'permissao_exclusao', 'permissao_admin', 'data_concessao', 'ativo')
            ->withTimestamps();
    }

    // Métodos de Autorização
    public function isAdmin(): bool
    {
        return $this->is_superadmin;
    }

    public function isManager(): bool
    {
        return $this->role === 'clientAdmin';
    }

    public function canAccess(string $permission): bool
    {
        return $this->is_active && (
            $this->is_superadmin ||
            in_array($permission, $this->getPermissions())
        );
    }

    protected function getPermissions(): array
    {
        $service = app(PermissionService::class);
        return $service->getRolePermissions($this->role);
    }

    // Métodos de Módulo (delegados para o Service)
    public function podeLerModulo(int $moduloId, ?int $autarquiaId = null): bool
    {
        $service = app(PermissionService::class);
        return $service->checkModulePermission($this, $moduloId, 'leitura', $autarquiaId);
    }

    public function podeEscreverModulo(int $moduloId, ?int $autarquiaId = null): bool
    {
        $service = app(PermissionService::class);
        return $service->checkModulePermission($this, $moduloId, 'escrita', $autarquiaId);
    }

    public function podeExcluirModulo(int $moduloId, ?int $autarquiaId = null): bool
    {
        $service = app(PermissionService::class);
        return $service->checkModulePermission($this, $moduloId, 'exclusao', $autarquiaId);
    }

    public function eAdminModulo(int $moduloId, ?int $autarquiaId = null): bool
    {
        $service = app(PermissionService::class);
        return $service->checkModulePermission($this, $moduloId, 'admin', $autarquiaId);
    }

    public function getModulosDisponiveis(?int $autarquiaId = null)
    {
        if ($this->is_superadmin) {
            return Modulo::ativos()->get();
        }

        $autarquiaId = $autarquiaId ?? $this->getAutarquiaAtivaId();

        return $this->modulos()
            ->wherePivot('autarquia_id', $autarquiaId)
            ->wherePivot('ativo', true)
            ->get();
    }

    public function getRoleParaAutarquia(?int $autarquiaId = null): string
    {
        if ($this->is_superadmin) {
            return 'suporteAdmin';
        }

        $autarquiaId ??= $this->getAutarquiaAtivaId();

        $pivot = $this->autarquias()
            ->where('autarquia_id', $autarquiaId)
            ->wherePivot('ativo', true)
            ->first()?->pivot;

        return $pivot?->role ?? $this->role;
    }

    // Accessor mantido no Model por ser específico de Eloquent
    public function getAutarquiaPreferidaAttribute()
    {
        $autarquiaId = session('autarquia_preferida_id');
        return $autarquiaId ? Autarquia::find($autarquiaId) : null;
    }
}
