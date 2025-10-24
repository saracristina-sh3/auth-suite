<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Session;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'cpf',
        'autarquia_ativa_id',
        'is_active',
        'is_superadmin'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'is_superadmin' => 'boolean',
            'autarquia_ativa_id' => 'integer',
        ];
    }

    public function getAutarquiaAtivaIdAttribute($value): ?int
    {
        // O contexto ativo é obtido preferencialmente da sessão para evitar leituras do campo persistido.
        $sessionValue = Session::get($this->getAutarquiaSessionKey());

        return $sessionValue !== null
            ? (int) $sessionValue
            : ($value !== null ? (int) $value : null);
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
    public function autarquiaAtiva(): BelongsTo
    {
        return $this->belongsTo(Autarquia::class, 'autarquia_ativa_id');
    }

    /**
     * Relacionamento: Autarquias ativas do usuário
     */
    public function autarquiasAtivas(): BelongsToMany
    {
        return $this->autarquias()->wherePivot('ativo', true);
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

        $autarquiaId = $autarquiaId ?? $this->autarquia_ativa_id;

        return $this->permissoesAtivas()
            ->where('modulo_id', $moduloId)
            ->where('autarquia_ativa_id', $autarquiaId)
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

        $autarquiaId = $autarquiaId ?? $this->autarquia_ativa_id;

        return $this->permissoesAtivas()
            ->where('modulo_id', $moduloId)
            ->where('autarquia_ativa_id', $autarquiaId)
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

        $autarquiaId = $autarquiaId ?? $this->autarquia_ativa_id;

        return $this->permissoesAtivas()
            ->where('modulo_id', $moduloId)
            ->where('autarquia_ativa_id', $autarquiaId)
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

        $autarquiaId = $autarquiaId ?? $this->autarquia_ativa_id;

        return $this->permissoesAtivas()
            ->where('modulo_id', $moduloId)
            ->where('autarquia_ativa_id', $autarquiaId)
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

        $autarquiaId = $autarquiaId ?? $this->autarquia_ativa_id;

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

        $autarquiaId ??= $this->autarquia_ativa_id;

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
        // Verifica se o usuário tem acesso à autarquia
        $temAcesso = $this->autarquias()
            ->where('autarquia_id', $autarquiaId)
            ->wherePivot('ativo', true)
            ->exists();

        // Superadmin SH3 não precisa ter vínculo explícito
        if (!$temAcesso && !$this->is_superadmin) {
            return false;
        }

        $this->setAutarquiaContext($autarquiaId);

        return true;
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

        $autarquiaId ??= $this->autarquia_ativa_id;

        $pivot = $this->autarquias()
            ->where('autarquia_id', $autarquiaId)
            ->wherePivot('ativo', true)
            ->first()?->pivot;

        return $pivot?->role ?? $this->role;
    }

    public function getAutarquiaSessionKey(): string
    {
        return 'autarquia_ativa_id_user_' . $this->id;
    }

    public function resolveDefaultAutarquiaId(): ?int
    {
        // Carregamos as autarquias vinculadas para determinar a preferida.
        $this->loadMissing('autarquias');

        return $this->autarquias
            ->first(fn ($autarquia) => (bool) ($autarquia->pivot->is_default ?? false))?->id
            ?? $this->autarquias->first()?->id
            ?? null;
    }

    /**
     * Centraliza a escrita da autarquia ativa garantindo isolamento por usuário e gravação na sessão.
     */
    public function setAutarquiaContext(?int $autarquiaId, bool $persistSession = true): void
    {
        // Mantemos o atributo em memória para que relacionamentos funcionem durante o request
        $this->setAttribute('autarquia_ativa_id', $autarquiaId);

        if (!$persistSession) {
            return;
        }

        // Namespacing por usuário garante isolamento mesmo com múltiplos tokens
        $sessionKey = $this->getAutarquiaSessionKey();

        if (!Session::isStarted()) {
            Session::start();
        }

        if ($autarquiaId === null) {
            Session::forget($sessionKey);
        } else {
            // Gravamos sempre via sessão para evitar persistência no banco.
            Session::put($sessionKey, $autarquiaId);
        }

        // Persistimos imediatamente para evitar race condition entre requisições paralelas
        Session::save();
    }

    public function clearAutarquiaContext(): void
    {
        $this->setAutarquiaContext(null);
    }
}
