# Guia de Migração - Autarquia Módulo (Chave Primária Artificial)

## 📋 Sumário

Esta migração adiciona uma chave primária artificial (`id`) à tabela `autarquia_modulo`, mantendo a integridade dos dados com uma constraint única composta.

## 🎯 Objetivo

Resolver incompatibilidades do Eloquent com chaves primárias compostas, permitindo o uso de métodos como `updateOrCreate()`, `firstOrCreate()`, etc.

## 📦 Arquivos Modificados

1. **Migration**: `2025_10_22_100000_add_id_primary_key_to_autarquia_modulo_table.php`
2. **Model**: `app/Models/AutarquiaModulo.php`
3. **Controller**: `app/Http/Controllers/Api/AutarquiaModuloController.php` (já atualizado)

## 🚀 Passos para Execução

### 1. Backup do Banco de Dados

**IMPORTANTE**: Sempre faça backup antes de executar migrations estruturais!

```bash
# PostgreSQL
pg_dump auth_suite > backup_auth_suite_$(date +%Y%m%d_%H%M%S).sql

# MySQL
mysqldump -u root -p auth_suite > backup_auth_suite_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Verificar o Estado Atual

```bash
cd /home/sara.pereira/Documentos/auth-suite/backend

# Ver dados atuais
php artisan tinker
>>> DB::table('autarquia_modulo')->count()
>>> DB::table('autarquia_modulo')->get()
```

### 3. Executar a Migration

```bash
php artisan migrate
```

**Saída esperada**:
```
Migrating: 2025_10_22_100000_add_id_primary_key_to_autarquia_modulo_table
Migrated:  2025_10_22_100000_add_id_primary_key_to_autarquia_modulo_table (123.45ms)
```

### 4. Verificar a Estrutura da Tabela

```bash
php artisan tinker

# PostgreSQL
>>> DB::select("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'autarquia_modulo' ORDER BY ordinal_position")

# MySQL
>>> DB::select("DESCRIBE autarquia_modulo")
```

**Estrutura esperada**:
| Campo | Tipo | Nulo | Chave | Padrão |
|-------|------|------|-------|--------|
| id | bigint unsigned | NO | PRI | auto_increment |
| autarquia_id | bigint unsigned | NO | MUL | NULL |
| modulo_id | bigint unsigned | NO | MUL | NULL |
| data_liberacao | timestamp | YES | | NULL |
| ativo | tinyint(1) | NO | MUL | 0 |
| created_at | timestamp | YES | | NULL |
| updated_at | timestamp | YES | | NULL |

**Índices esperados**:
- PRIMARY KEY: `id`
- UNIQUE KEY: `unique_autarquia_modulo` (autarquia_id, modulo_id)
- INDEX: `autarquia_modulo_autarquia_id_index`
- INDEX: `autarquia_modulo_modulo_id_index`
- INDEX: `autarquia_modulo_ativo_index`
- INDEX: `autarquia_modulo_data_liberacao_index`
- FOREIGN KEY: `autarquia_id` → `autarquias.id`
- FOREIGN KEY: `modulo_id` → `modulos.id`

## 📝 Exemplos de Uso no Controller

### Antes (com chave composta - QUEBRAVA)

```php
// ❌ ERRO: updateOrCreate não funciona com chave composta
$liberacao = AutarquiaModulo::updateOrCreate(
    ['autarquia_id' => 1, 'modulo_id' => 2],
    ['ativo' => true]
);
```

### Depois (com id artificial - FUNCIONA)

```php
// ✅ FUNCIONA: updateOrCreate usa o id internamente
$liberacao = AutarquiaModulo::updateOrCreate(
    ['autarquia_id' => 1, 'modulo_id' => 2],
    ['ativo' => true, 'data_liberacao' => now()]
);

// ✅ Buscar por autarquia e módulo
$liberacao = AutarquiaModulo::where('autarquia_id', 1)
    ->where('modulo_id', 2)
    ->first();

// ✅ Usar scopes
$liberacoes = AutarquiaModulo::byAutarquia(1)->ativas()->get();

// ✅ Atualizar em massa
foreach ($modulos as $moduloData) {
    AutarquiaModulo::updateOrCreate(
        [
            'autarquia_id' => $autarquiaId,
            'modulo_id' => $moduloData['modulo_id'],
        ],
        [
            'ativo' => $moduloData['ativo'],
            'data_liberacao' => $moduloData['ativo'] ? now() : null,
        ]
    );
}
```

## ✅ Validações Pós-Migração

### 1. Testar updateOrCreate

```bash
php artisan tinker

>>> $liberacao = \App\Models\AutarquiaModulo::updateOrCreate(
...     ['autarquia_id' => 1, 'modulo_id' => 1],
...     ['ativo' => true, 'data_liberacao' => now()]
... );
>>> $liberacao->id // Deve mostrar um ID numérico
>>> $liberacao->ativo // Deve ser true
```

### 2. Testar Constraint Única

```bash
php artisan tinker

# Tentar criar duplicata (deve falhar)
>>> DB::table('autarquia_modulo')->insert([
...     'autarquia_id' => 1,
...     'modulo_id' => 1,
...     'ativo' => false,
...     'created_at' => now(),
...     'updated_at' => now()
... ]);
// Erro esperado: Duplicate entry for key 'unique_autarquia_modulo'
```

### 3. Testar Relações

```bash
php artisan tinker

>>> $liberacao = \App\Models\AutarquiaModulo::first();
>>> $liberacao->autarquia->nome // Nome da autarquia
>>> $liberacao->modulo->nome // Nome do módulo
```

### 4. Testar no Frontend

1. Acesse a aba "Liberações" no painel de suporte
2. Selecione uma autarquia
3. Ative/desative módulos
4. Clique em "Salvar Alterações"
5. Verifique o console (não deve haver erros)

## 🔄 Rollback (Se Necessário)

Se algo der errado, você pode reverter a migração:

```bash
php artisan migrate:rollback --step=1

# Ou restaurar do backup
psql auth_suite < backup_auth_suite_YYYYMMDD_HHMMSS.sql
# ou
mysql -u root -p auth_suite < backup_auth_suite_YYYYMMDD_HHMMSS.sql
```

## ⚠️ Problemas Conhecidos e Soluções

### Problema: "Duplicate entry for key 'unique_autarquia_modulo'"

**Causa**: Tentando criar um registro que já existe.

**Solução**: Usar `updateOrCreate()` ao invés de `create()` ou `insert()`.

### Problema: "No query results for model [App\\Models\\AutarquiaModulo]"

**Causa**: Usando `firstOrFail()` quando o registro não existe.

**Solução**: Usar `updateOrCreate()` que cria se não existir.

### Problema: Índices duplicados

**Causa**: A migration tentou criar índices que já existem.

**Solução**: A migration já tem verificações para evitar isso.

## 📊 Impacto nos Dados

- **Dados preservados**: ✅ Todos os dados existentes permanecem intactos
- **Performance**: ✅ Índices mantidos/otimizados
- **Relações**: ✅ Foreign keys preservadas
- **Compatibilidade**: ✅ 100% retrocompatível com queries existentes

## 🎉 Benefícios

1. ✅ `updateOrCreate()` funciona corretamente
2. ✅ `firstOrCreate()` funciona corretamente
3. ✅ Eloquent relationships funcionam nativamente
4. ✅ Constraint única previne duplicatas
5. ✅ Performance mantida com índices apropriados
6. ✅ Compatibilidade total com código existente
7. ✅ Migrations reversíveis

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs do Laravel: `storage/logs/laravel.log`
2. Verifique os logs do banco de dados
3. Reverta a migration e restaure do backup
4. Documente o erro e peça ajuda

---

**Data de Criação**: 2025-10-22
**Versão**: 1.0
**Status**: ✅ Pronto para produção
