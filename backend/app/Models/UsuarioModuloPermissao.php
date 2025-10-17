<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UsuarioModuloPermissao extends Model
{
    use HasFactory;

    protected $table = 'usuario_modulo_permissao';

    // Chave primária composta
    protected $primaryKey = ['user_id', 'modulo_id', 'autarquia_id'];
    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'modulo_id',
        'autarquia_id',
        'permissao_leitura',
        'permissao_escrita',
        'permissao_exclusao',
        'permissao_admin',
        'data_concessao',
        'ativo',
    ];

    protected $casts = [
        'permissao_leitura' => 'boolean',
        'permissao_escrita' => 'boolean',
        'permissao_exclusao' => 'boolean',
        'permissao_admin' => 'boolean',
        'data_concessao' => 'datetime',
        'ativo' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relacionamento: Pertence a um usuário
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Relacionamento: Pertence a um módulo
     */
    public function modulo(): BelongsTo
    {
        return $this->belongsTo(Modulo::class, 'modulo_id');
    }

    /**
     * Relacionamento: Pertence a uma autarquia
     */
    public function autarquia(): BelongsTo
    {
        return $this->belongsTo(Autarquia::class, 'autarquia_id');
    }

    /**
     * Scope: Apenas permissões ativas
     */
    public function scopeAtivas($query)
    {
        return $query->where('ativo', true);
    }

    /**
     * Scope: Permissões de um usuário específico
     */
    public function scopeDoUsuario($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope: Permissões de uma autarquia específica
     */
    public function scopeDaAutarquia($query, int $autarquiaId)
    {
        return $query->where('autarquia_id', $autarquiaId);
    }

    /**
     * Scope: Permissões de um módulo específico
     */
    public function scopeDoModulo($query, int $moduloId)
    {
        return $query->where('modulo_id', $moduloId);
    }

    /**
     * Verifica se o usuário tem permissão de leitura
     */
    public function podeLer(): bool
    {
        return $this->ativo && $this->permissao_leitura;
    }

    /**
     * Verifica se o usuário tem permissão de escrita
     */
    public function podeEscrever(): bool
    {
        return $this->ativo && $this->permissao_escrita;
    }

    /**
     * Verifica se o usuário tem permissão de exclusão
     */
    public function podeExcluir(): bool
    {
        return $this->ativo && $this->permissao_exclusao;
    }

    /**
     * Verifica se o usuário é admin do módulo
     */
    public function eAdmin(): bool
    {
        return $this->ativo && $this->permissao_admin;
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
