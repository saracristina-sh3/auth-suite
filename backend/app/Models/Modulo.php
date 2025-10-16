<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Modulo extends Model
{
    use HasFactory;

    protected $table = 'modulos';

    protected $fillable = [
        'nome',
        'descricao',
        'icone',
        'ativo',
    ];

    protected $casts = [
        'ativo' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relacionamento: Módulo pertence a muitas autarquias
     */
    public function autarquias(): BelongsToMany
    {
        return $this->belongsToMany(Autarquia::class, 'autarquia_modulo', 'modulo_id', 'autarquia_id')
            ->withPivot('data_liberacao', 'ativo')
            ->withTimestamps();
    }

    /**
     * Relacionamento: Módulo pertence a muitas autarquias ativas
     */
    public function autarquiasAtivas(): BelongsToMany
    {
        return $this->autarquias()->wherePivot('ativo', true);
    }

    /**
     * Relacionamento: Módulo possui muitas permissões de usuários
     */
    public function usuarioPermissoes(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'usuario_modulo_permissao', 'modulo_id', 'user_id')
            ->withPivot('autarquia_id', 'permissao_leitura', 'permissao_escrita', 'permissao_exclusao', 'permissao_admin', 'data_concessao', 'ativo')
            ->withTimestamps();
    }

    /**
     * Scope: Apenas módulos ativos
     */
    public function scopeAtivos($query)
    {
        return $query->where('ativo', true);
    }

    /**
     * Verifica se o módulo está liberado para a autarquia
     */
    public function estaLiberadoParaAutarquia(int $autarquiaId): bool
    {
        return $this->autarquiasAtivas()->where('autarquia_id', $autarquiaId)->exists();
    }
}
