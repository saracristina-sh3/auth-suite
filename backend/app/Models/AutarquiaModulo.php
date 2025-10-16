<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AutarquiaModulo extends Model
{
    use HasFactory;

    protected $table = 'autarquia_modulo';

    // Chave primária composta
    protected $primaryKey = ['autarquia_id', 'modulo_id'];
    public $incrementing = false;

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
     * Override do método getKeyName para chave composta
     */
    public function getKeyName()
    {
        return $this->primaryKey;
    }

    /**
     * Override do método setKeysForSaveQuery para chave composta
     */
    protected function setKeysForSaveQuery($query)
    {
        $keys = $this->getKeyName();
        if (!is_array($keys)) {
            return parent::setKeysForSaveQuery($query);
        }

        foreach ($keys as $keyName) {
            $query->where($keyName, '=', $this->getKeyForSaveQuery($keyName));
        }

        return $query;
    }

    /**
     * Override do método getKeyForSaveQuery para chave composta
     */
    protected function getKeyForSaveQuery($keyName = null)
    {
        if (is_null($keyName)) {
            $keyName = $this->getKeyName();
        }

        if (isset($this->original[$keyName])) {
            return $this->original[$keyName];
        }

        return $this->getAttribute($keyName);
    }
}
