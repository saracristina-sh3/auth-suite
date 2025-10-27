<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AutarquiaModulo extends Model
{
    use HasFactory;

    protected $table = 'autarquia_modulo';

    protected $fillable = [
        'autarquia_id',
        'modulo_id',
        'data_liberacao',
        'ativo',
    ];

    protected $casts = [
        'data_liberacao' => 'datetime',
        'ativo' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relacionamento: Pertence a uma autarquia
     */
    public function autarquia(): BelongsTo
    {
        return $this->belongsTo(Autarquia::class, 'autarquia_id');
    }

    /**
     * Relacionamento: Pertence a um módulo
     */
    public function modulo(): BelongsTo
    {
        return $this->belongsTo(Modulo::class, 'modulo_id');
    }

    /**
     * Scope: Apenas liberações ativas
     */
    public function scopeAtivas($query)
    {
        return $query->where('ativo', true);
    }

    /**
     * Scope: Liberações por autarquia
     */
    public function scopeByAutarquia($query, int $autarquiaId)
    {
        return $query->where('autarquia_id', $autarquiaId);
    }

    /**
     * Scope: Liberações por módulo
     */
    public function scopeByModulo($query, int $moduloId)
    {
        return $query->where('modulo_id', $moduloId);
    }
}
