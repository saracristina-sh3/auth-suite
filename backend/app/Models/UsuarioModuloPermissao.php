<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Traits\HasCompositePrimaryKey;
use App\Traits\PermissionScopes;
use App\Traits\PermissionChecks;

class UsuarioModuloPermissao extends Model
{
    use HasFactory, HasCompositePrimaryKey, PermissionScopes, PermissionChecks;

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
}
