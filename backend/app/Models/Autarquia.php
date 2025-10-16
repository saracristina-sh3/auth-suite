<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Autarquia extends Model
{
    use HasFactory;

    protected $table = 'autarquias';

    protected $fillable = [
        'nome',
        'ativo',
    ];

    protected $casts = [
        'ativo' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relacionamento: Autarquia possui muitos usuários
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'autarquia_id');
    }

    /**
     * Relacionamento: Autarquia possui muitos usuários ativos
     */
    public function usersAtivos(): HasMany
    {
        return $this->users()->where('is_active', true);
    }

    /**
     * Relacionamento: Autarquia tem acesso a muitos módulos
     */
    public function modulos(): BelongsToMany
    {
        return $this->belongsToMany(Modulo::class, 'autarquia_modulo', 'autarquia_id', 'modulo_id')
            ->withPivot('data_liberacao', 'ativo')
            ->withTimestamps();
    }

    /**
     * Relacionamento: Autarquia tem acesso a muitos módulos ativos
     */
    public function modulosAtivos(): BelongsToMany
    {
        return $this->modulos()->wherePivot('ativo', true);
    }

    /**
     * Scope: Apenas autarquias ativas
     */
    public function scopeAtivas($query)
    {
        return $query->where('ativo', true);
    }

    /**
     * Verifica se a autarquia tem acesso ao módulo
     */
    public function temAcessoAoModulo(int $moduloId): bool
    {
        return $this->modulosAtivos()->where('modulo_id', $moduloId)->exists();
    }
}
