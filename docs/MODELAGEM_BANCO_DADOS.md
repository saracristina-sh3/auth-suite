# Modelagem do Banco de Dados - Auth Suite

**Versão:** 2.0
**Data:** 22 de Outubro de 2025
**SGBD:** PostgreSQL 17
**ORM:** Laravel Eloquent

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Diagrama Entidade-Relacionamento](#diagrama-entidade-relacionamento)
3. [Tabelas](#tabelas)
4. [Relacionamentos](#relacionamentos)
5. [Índices e Otimizações](#índices-e-otimizações)
6. [Regras de Negócio](#regras-de-negócio)
7. [Queries Comuns](#queries-comuns)

---

## Visão Geral

O sistema Auth Suite utiliza uma arquitetura de banco de dados relacional multi-tenant (multi-autarquia) com controle granular de permissões por módulo e autarquia.

### Características Principais

- **Multi-Tenancy**: Suporte a múltiplas autarquias isoladas
- **Multi-Autarquia por Usuário**: Um usuário pode pertencer a várias autarquias
- **Controle de Acesso Granular**: Permissões específicas por módulo, usuário e autarquia
- **Sistema Modular**: Módulos podem ser ativados/desativados por autarquia
- **Hierarquia de Permissões**: SuperAdmin > Admin de Autarquia > Usuário Comum
- **Soft Deletes**: Registros são marcados como inativos ao invés de deletados

### Estatísticas

- **Total de Tabelas:** 11
- **Tabelas de Domínio:** 4 (users, autarquias, modulos, usuario_modulo_permissao)
- **Tabelas Pivot:** 2 (usuario_autarquia, autarquia_modulo)
- **Tabelas de Sistema:** 5 (sessions, cache, jobs, personal_access_tokens, password_reset_tokens)

---

## Diagrama Entidade-Relacionamento

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DIAGRAMA ER - AUTH SUITE                        │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐           ┌──────────────────────┐
│      USERS       │           │   USUARIO_AUTARQUIA  │
├──────────────────┤           ├──────────────────────┤
│ id (PK)          │◄─────────┤│ id (PK)              │
│ name             │   1    N ││ user_id (FK)         │
│ email (UNIQUE)   │           ││ autarquia_id (FK)    │
│ password         │           ││ role                 │
│ cpf (UNIQUE)     │           ││ is_admin             │
│ role             │           ││ is_default           │
│ is_superadmin    │           ││ ativo                │
│ is_active        │           ││ data_vinculo         │
│ autarquia_ativa  │           ││ created_at           │
│   _id (FK)       │           ││ updated_at           │
│ created_at       │           │└──────────────────────┘
│ updated_at       │           │         │
└──────────────────┘           │         │
        │                      │         │ N
        │                      │         ▼
        │                      │ ┌──────────────────┐
        │                      └─┤   AUTARQUIAS     │
        │                      1 ├──────────────────┤
        │                        │ id (PK)          │
        │                        │ nome (UNIQUE)    │
        │                        │ ativo            │
        │                        │ created_at       │
        │                        │ updated_at       │
        │                        └──────────────────┘
        │                                │
        │                                │ N
        │                                ▼
        │                        ┌──────────────────────┐
        │                        │  AUTARQUIA_MODULO    │
        │                        ├──────────────────────┤
        │                        │ autarquia_id (PK,FK) │
        │                        │ modulo_id (PK,FK)    │
        │                        │ data_liberacao       │
        │                        │ ativo                │
        │                        │ created_at           │
        │                        │ updated_at           │
        │                        └──────────────────────┘
        │                                │
        │                                │ N
        │                                ▼
        │                        ┌──────────────────┐
        │                        │     MODULOS      │
        │                        ├──────────────────┤
        │                        │ id (PK)          │
        │                        │ nome (UNIQUE)    │
        │                        │ descricao        │
        │                        │ icone            │
        │                        │ ativo            │
        │                        │ created_at       │
        │                        │ updated_at       │
        │                        └──────────────────┘
        │                                │
        │                                │
        └────────────────┐               │
                         │ N             │ N
                         ▼               ▼
              ┌──────────────────────────────────┐
              │ USUARIO_MODULO_PERMISSAO         │
              ├──────────────────────────────────┤
              │ user_id (PK,FK)                  │
              │ modulo_id (PK,FK)                │
              │ autarquia_id (PK,FK)             │
              │ permissao_leitura                │
              │ permissao_escrita                │
              │ permissao_exclusao               │
              │ permissao_admin                  │
              │ data_concessao                   │
              │ ativo                            │
              │ created_at                       │
              │ updated_at                       │
              └──────────────────────────────────┘
```

---

## Tabelas

### 1. users

Armazena os usuários do sistema.

**Estrutura:**

| Campo | Tipo | Atributos | Descrição |
|-------|------|-----------|-----------|
| id | BIGSERIAL | PK | Identificador único |
| name | VARCHAR(255) | NOT NULL | Nome completo |
| email | VARCHAR(255) | NOT NULL, UNIQUE | Email de login |
| email_verified_at | TIMESTAMP | NULL | Data de verificação do email |
| password | VARCHAR(255) | NOT NULL | Senha criptografada (bcrypt) |
| cpf | VARCHAR(11) | NOT NULL, UNIQUE | CPF do usuário |
| role | VARCHAR(50) | NOT NULL, DEFAULT 'user' | Papel do usuário |
| is_superadmin | BOOLEAN | NOT NULL, DEFAULT false | Indica se é SuperAdmin SH3 |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | Indica se está ativo |
| autarquia_ativa_id | BIGINT | NULL, FK | Autarquia no contexto atual |
| remember_token | VARCHAR(100) | NULL | Token de "lembrar-me" |
| created_at | TIMESTAMP | NOT NULL | Data de criação |
| updated_at | TIMESTAMP | NOT NULL | Data de atualização |

**Valores de role:**
- `user` - Usuário comum
- `clientAdmin` - Administrador de autarquia
- `suporteAdmin` - Administrador de suporte (apenas SuperAdmin)

**Índices:**
- PRIMARY KEY (id)
- UNIQUE (email)
- UNIQUE (cpf)
- INDEX (autarquia_ativa_id)
- INDEX (is_active)
- INDEX (is_superadmin)

**Chaves Estrangeiras:**
- autarquia_ativa_id → autarquias(id) ON DELETE SET NULL

---

### 2. autarquias

Armazena as autarquias (organizações/entidades) do sistema.

**Estrutura:**

| Campo | Tipo | Atributos | Descrição |
|-------|------|-----------|-----------|
| id | BIGSERIAL | PK | Identificador único |
| nome | VARCHAR(255) | NOT NULL, UNIQUE | Nome da autarquia |
| ativo | BOOLEAN | NOT NULL, DEFAULT true | Indica se está ativa |
| created_at | TIMESTAMP | NOT NULL | Data de criação |
| updated_at | TIMESTAMP | NOT NULL | Data de atualização |

**Índices:**
- PRIMARY KEY (id)
- UNIQUE (nome)
- INDEX (ativo)
- INDEX (nome)

**Observações:**
- Cada autarquia representa uma organização independente
- Dados são isolados por autarquia (multi-tenancy)
- Autarquias inativas não aparecem no sistema

---

### 3. modulos

Armazena os módulos disponíveis no sistema.

**Estrutura:**

| Campo | Tipo | Atributos | Descrição |
|-------|------|-----------|-----------|
| id | BIGSERIAL | PK | Identificador único |
| nome | VARCHAR(255) | NOT NULL, UNIQUE | Nome do módulo |
| descricao | TEXT | NULL | Descrição detalhada |
| icone | VARCHAR(100) | NULL | Ícone PrimeIcons (ex: pi-car) |
| ativo | BOOLEAN | NOT NULL, DEFAULT true | Indica se está ativo |
| created_at | TIMESTAMP | NOT NULL | Data de criação |
| updated_at | TIMESTAMP | NOT NULL | Data de atualização |

**Índices:**
- PRIMARY KEY (id)
- UNIQUE (nome)
- INDEX (ativo)
- INDEX (nome)

**Módulos Padrão:**
- Gestão de Frota
- Recursos Humanos
- Almoxarifado
- Patrimônio
- Compras
- Contratos

---

### 4. usuario_autarquia (PIVOT)

Relacionamento N:N entre usuários e autarquias.

**Estrutura:**

| Campo | Tipo | Atributos | Descrição |
|-------|------|-----------|-----------|
| id | BIGSERIAL | PK | Identificador único |
| user_id | BIGINT | NOT NULL, FK | ID do usuário |
| autarquia_id | BIGINT | NOT NULL, FK | ID da autarquia |
| role | VARCHAR(50) | NOT NULL, DEFAULT 'user' | Papel na autarquia |
| is_admin | BOOLEAN | NOT NULL, DEFAULT false | Admin da autarquia |
| is_default | BOOLEAN | NOT NULL, DEFAULT false | Autarquia padrão |
| ativo | BOOLEAN | NOT NULL, DEFAULT true | Vínculo ativo |
| data_vinculo | TIMESTAMP | NOT NULL | Data do vínculo |
| created_at | TIMESTAMP | NOT NULL | Data de criação |
| updated_at | TIMESTAMP | NOT NULL | Data de atualização |

**Índices:**
- PRIMARY KEY (id)
- UNIQUE (user_id, autarquia_id)
- INDEX (user_id)
- INDEX (autarquia_id)
- INDEX (user_id, autarquia_id)
- INDEX (ativo)

**Chaves Estrangeiras:**
- user_id → users(id) ON DELETE CASCADE
- autarquia_id → autarquias(id) ON DELETE CASCADE

**Regras:**
- Um usuário pode ter múltiplos vínculos com autarquias
- Apenas um vínculo pode ser `is_default = true` por usuário
- `is_admin` indica se o usuário é administrador daquela autarquia específica

---

### 5. autarquia_modulo (PIVOT)

Relacionamento N:N entre autarquias e módulos (liberação de acesso).

**Estrutura:**

| Campo | Tipo | Atributos | Descrição |
|-------|------|-----------|-----------|
| autarquia_id | BIGINT | PK, FK | ID da autarquia |
| modulo_id | BIGINT | PK, FK | ID do módulo |
| data_liberacao | TIMESTAMP | NOT NULL | Data da liberação |
| ativo | BOOLEAN | NOT NULL, DEFAULT true | Liberação ativa |
| created_at | TIMESTAMP | NOT NULL | Data de criação |
| updated_at | TIMESTAMP | NOT NULL | Data de atualização |

**Índices:**
- PRIMARY KEY (autarquia_id, modulo_id)
- INDEX (autarquia_id)
- INDEX (modulo_id)
- INDEX (ativo)
- INDEX (data_liberacao)

**Chaves Estrangeiras:**
- autarquia_id → autarquias(id) ON DELETE RESTRICT ON UPDATE CASCADE
- modulo_id → modulos(id) ON DELETE RESTRICT ON UPDATE CASCADE

**Regras:**
- Define quais módulos cada autarquia pode acessar
- Um módulo só pode ser liberado uma vez por autarquia
- Liberações inativas não concedem acesso

---

### 6. usuario_modulo_permissao

Permissões granulares de usuários em módulos por autarquia.

**Estrutura:**

| Campo | Tipo | Atributos | Descrição |
|-------|------|-----------|-----------|
| user_id | BIGINT | PK, FK | ID do usuário |
| modulo_id | BIGINT | PK, FK | ID do módulo |
| autarquia_id | BIGINT | PK, FK | ID da autarquia |
| permissao_leitura | BOOLEAN | NOT NULL, DEFAULT false | Pode visualizar |
| permissao_escrita | BOOLEAN | NOT NULL, DEFAULT false | Pode criar/editar |
| permissao_exclusao | BOOLEAN | NOT NULL, DEFAULT false | Pode excluir |
| permissao_admin | BOOLEAN | NOT NULL, DEFAULT false | Admin do módulo |
| data_concessao | TIMESTAMP | NOT NULL | Data da concessão |
| ativo | BOOLEAN | NOT NULL, DEFAULT true | Permissão ativa |
| created_at | TIMESTAMP | NOT NULL | Data de criação |
| updated_at | TIMESTAMP | NOT NULL | Data de atualização |

**Índices:**
- PRIMARY KEY (user_id, modulo_id, autarquia_id)
- INDEX (user_id)
- INDEX (modulo_id)
- INDEX (autarquia_id)
- INDEX (ativo)
- INDEX (user_id, ativo)
- INDEX (autarquia_id, modulo_id)

**Chaves Estrangeiras:**
- user_id → users(id) ON DELETE RESTRICT ON UPDATE CASCADE
- modulo_id → modulos(id) ON DELETE RESTRICT ON UPDATE CASCADE
- autarquia_id → autarquias(id) ON DELETE RESTRICT ON UPDATE CASCADE
- (autarquia_id, modulo_id) → autarquia_modulo(autarquia_id, modulo_id) ON DELETE RESTRICT

**Regras:**
- Um usuário só pode ter permissões em módulos liberados para a autarquia
- A constraint composta garante integridade referencial
- `permissao_admin` concede todas as permissões no módulo

---

### 7. sessions

Gerenciamento de sessões (Laravel).

**Estrutura:**

| Campo | Tipo | Atributos | Descrição |
|-------|------|-----------|-----------|
| id | VARCHAR(255) | PK | ID da sessão |
| user_id | BIGINT | NULL, FK | ID do usuário |
| ip_address | VARCHAR(45) | NULL | IP do cliente |
| user_agent | TEXT | NULL | User agent do navegador |
| payload | LONGTEXT | NOT NULL | Dados da sessão |
| last_activity | INTEGER | NOT NULL | Timestamp última atividade |

**Índices:**
- PRIMARY KEY (id)
- INDEX (user_id)
- INDEX (last_activity)

---

### 8. personal_access_tokens

Tokens de autenticação (Laravel Sanctum).

**Estrutura:**

| Campo | Tipo | Atributos | Descrição |
|-------|------|-----------|-----------|
| id | BIGSERIAL | PK | Identificador único |
| tokenable_type | VARCHAR(255) | NOT NULL | Tipo do modelo |
| tokenable_id | BIGINT | NOT NULL | ID do modelo |
| name | VARCHAR(255) | NOT NULL | Nome do token |
| token | VARCHAR(64) | NOT NULL, UNIQUE | Hash do token |
| abilities | TEXT | NULL | Permissões do token |
| last_used_at | TIMESTAMP | NULL | Última utilização |
| expires_at | TIMESTAMP | NULL | Data de expiração |
| created_at | TIMESTAMP | NOT NULL | Data de criação |
| updated_at | TIMESTAMP | NOT NULL | Data de atualização |

**Índices:**
- PRIMARY KEY (id)
- UNIQUE (token)
- INDEX (tokenable_type, tokenable_id)

---

### 9. password_reset_tokens

Tokens de recuperação de senha.

**Estrutura:**

| Campo | Tipo | Atributos | Descrição |
|-------|------|-----------|-----------|
| email | VARCHAR(255) | PK | Email do usuário |
| token | VARCHAR(255) | NOT NULL | Token de reset |
| created_at | TIMESTAMP | NULL | Data de criação |

**Índices:**
- PRIMARY KEY (email)

---

### 10. cache

Cache do sistema (Laravel).

**Estrutura:**

| Campo | Tipo | Atributos | Descrição |
|-------|------|-----------|-----------|
| key | VARCHAR(255) | PK | Chave do cache |
| value | MEDIUMTEXT | NOT NULL | Valor cacheado |
| expiration | INTEGER | NOT NULL | Timestamp de expiração |

**Índices:**
- PRIMARY KEY (key)
- INDEX (expiration)

---

### 11. jobs

Filas de trabalho (Laravel Queue).

**Estrutura:**

| Campo | Tipo | Atributos | Descrição |
|-------|------|-----------|-----------|
| id | BIGSERIAL | PK | Identificador único |
| queue | VARCHAR(255) | NOT NULL | Nome da fila |
| payload | LONGTEXT | NOT NULL | Dados do job |
| attempts | TINYINT | NOT NULL | Tentativas |
| reserved_at | INTEGER | NULL | Timestamp de reserva |
| available_at | INTEGER | NOT NULL | Timestamp disponível |
| created_at | INTEGER | NOT NULL | Timestamp de criação |

**Índices:**
- PRIMARY KEY (id)
- INDEX (queue)

---

## Relacionamentos

### Diagrama de Relacionamentos Resumido

```
┌───────────┐
│   USER    │
└───────────┘
      │
      ├─── N:N ───> AUTARQUIA (via usuario_autarquia)
      │                 │
      │                 └─── N:N ───> MODULO (via autarquia_modulo)
      │                                   │
      └─────────────── N:N ───────────────┘
                (via usuario_modulo_permissao)
```

### Relacionamentos Detalhados

#### 1. User ↔ Autarquia (N:N)

**Tabela Pivot:** `usuario_autarquia`

**Relacionamento:**
- Um usuário pode pertencer a múltiplas autarquias
- Uma autarquia pode ter múltiplos usuários

**Campos Extras:**
- `role`: papel do usuário na autarquia
- `is_admin`: indica se é admin da autarquia
- `is_default`: indica autarquia padrão
- `ativo`: indica se vínculo está ativo

**Eloquent:**
```php
// No modelo User
public function autarquias(): BelongsToMany
{
    return $this->belongsToMany(Autarquia::class, 'usuario_autarquia')
        ->withPivot('role', 'is_admin', 'is_default', 'ativo', 'data_vinculo')
        ->withTimestamps();
}

// No modelo Autarquia
public function users(): BelongsToMany
{
    return $this->belongsToMany(User::class, 'usuario_autarquia')
        ->withPivot('role', 'is_admin', 'is_default', 'ativo', 'data_vinculo')
        ->withTimestamps();
}
```

---

#### 2. Autarquia ↔ Modulo (N:N)

**Tabela Pivot:** `autarquia_modulo`

**Relacionamento:**
- Uma autarquia pode ter acesso a múltiplos módulos
- Um módulo pode ser acessado por múltiplas autarquias

**Campos Extras:**
- `data_liberacao`: data de liberação do módulo
- `ativo`: indica se liberação está ativa

**Eloquent:**
```php
// No modelo Autarquia
public function modulos(): BelongsToMany
{
    return $this->belongsToMany(Modulo::class, 'autarquia_modulo')
        ->withPivot('data_liberacao', 'ativo')
        ->withTimestamps();
}

// No modelo Modulo
public function autarquias(): BelongsToMany
{
    return $this->belongsToMany(Autarquia::class, 'autarquia_modulo')
        ->withPivot('data_liberacao', 'ativo')
        ->withTimestamps();
}
```

---

#### 3. User ↔ Modulo (N:N) - Permissões

**Tabela:** `usuario_modulo_permissao`

**Relacionamento:**
- Um usuário pode ter permissões em múltiplos módulos
- Um módulo pode ter permissões de múltiplos usuários
- Permissões são contextualizadas por autarquia

**Campos de Permissão:**
- `permissao_leitura`: visualizar dados
- `permissao_escrita`: criar/editar dados
- `permissao_exclusao`: excluir dados
- `permissao_admin`: admin do módulo (todas permissões)

**Eloquent:**
```php
// No modelo User
public function modulos(): BelongsToMany
{
    return $this->belongsToMany(Modulo::class, 'usuario_modulo_permissao')
        ->withPivot('autarquia_id', 'permissao_leitura', 'permissao_escrita',
                    'permissao_exclusao', 'permissao_admin', 'data_concessao', 'ativo')
        ->withTimestamps();
}
```

---

#### 4. User → Autarquia Ativa (1:1)

**Campo:** `users.autarquia_ativa_id`

**Relacionamento:**
- Um usuário tem uma autarquia ativa (contexto atual)
- Indica qual autarquia está sendo usada no momento

**Eloquent:**
```php
// No modelo User
public function autarquiaAtiva(): BelongsTo
{
    return $this->belongsTo(Autarquia::class, 'autarquia_ativa_id');
}
```

---

## Índices e Otimizações

### Índices Principais

#### Tabela: users
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_cpf ON users(cpf);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_is_superadmin ON users(is_superadmin);
CREATE INDEX idx_users_autarquia_ativa ON users(autarquia_ativa_id);
```

#### Tabela: usuario_autarquia
```sql
CREATE INDEX idx_ua_user_id ON usuario_autarquia(user_id);
CREATE INDEX idx_ua_autarquia_id ON usuario_autarquia(autarquia_id);
CREATE INDEX idx_ua_user_autarquia ON usuario_autarquia(user_id, autarquia_id);
CREATE INDEX idx_ua_ativo ON usuario_autarquia(ativo);
```

#### Tabela: usuario_modulo_permissao
```sql
CREATE INDEX idx_ump_user_id ON usuario_modulo_permissao(user_id);
CREATE INDEX idx_ump_modulo_id ON usuario_modulo_permissao(modulo_id);
CREATE INDEX idx_ump_autarquia_id ON usuario_modulo_permissao(autarquia_id);
CREATE INDEX idx_ump_user_ativo ON usuario_modulo_permissao(user_id, ativo);
CREATE INDEX idx_ump_aut_mod ON usuario_modulo_permissao(autarquia_id, modulo_id);
```

#### Tabela: autarquia_modulo
```sql
CREATE INDEX idx_am_autarquia_id ON autarquia_modulo(autarquia_id);
CREATE INDEX idx_am_modulo_id ON autarquia_modulo(modulo_id);
CREATE INDEX idx_am_ativo ON autarquia_modulo(ativo);
CREATE INDEX idx_am_data_liberacao ON autarquia_modulo(data_liberacao);
```

### Otimizações de Performance

1. **Índices Compostos**: Para queries que filtram por múltiplas colunas
2. **Índices em Foreign Keys**: Acelera JOINs
3. **Índices em Campos Booleanos**: Para filtros de ativo/inativo
4. **Particionamento**: Considerar para tabelas muito grandes (futuro)

---

## Regras de Negócio

### 1. Hierarquia de Usuários

```
SuperAdmin (is_superadmin = true)
    └─> Acesso total ao sistema
    └─> Pode assumir contexto de qualquer autarquia
    └─> Não precisa de permissões explícitas

Admin de Autarquia (is_admin = true em usuario_autarquia)
    └─> Gerencia usuários da autarquia
    └─> Gerencia dados da autarquia
    └─> Limitado aos módulos liberados

Usuário Comum (role = 'user')
    └─> Acesso baseado em permissões explícitas
    └─> Limitado a autarquias vinculadas
    └─> Limitado a módulos com permissão
```

### 2. Controle de Acesso

#### Níveis de Permissão

1. **Leitura** (`permissao_leitura`)
   - Visualizar dados
   - Listar registros
   - Gerar relatórios

2. **Escrita** (`permissao_escrita`)
   - Criar novos registros
   - Editar registros existentes
   - Requer permissão de leitura

3. **Exclusão** (`permissao_exclusao`)
   - Excluir registros
   - Requer permissão de escrita

4. **Admin** (`permissao_admin`)
   - Todas as permissões acima
   - Gerenciar configurações do módulo

#### Validação de Permissões

```php
// Verificar acesso a módulo
$user->podeLerModulo($moduloId, $autarquiaId);
$user->podeEscreverModulo($moduloId, $autarquiaId);
$user->podeExcluirModulo($moduloId, $autarquiaId);
$user->eAdminModulo($moduloId, $autarquiaId);

// Verificar liberação de módulo para autarquia
$autarquia->temAcessoAoModulo($moduloId);
$modulo->estaLiberadoParaAutarquia($autarquiaId);
```

### 3. Multi-Autarquia

#### Regras de Vínculo

1. Um usuário pode ter múltiplos vínculos com autarquias
2. Apenas um vínculo pode ser `is_default = true` por usuário
3. O campo `autarquia_ativa_id` indica o contexto atual
4. Trocar autarquia: `$user->trocarAutarquia($autarquiaId)`

#### Isolamento de Dados

- Dados são sempre filtrados pela `autarquia_ativa_id`
- SuperAdmin pode ver dados de todas autarquias
- Contexto de suporte permite assumir autarquia temporariamente

### 4. Liberação de Módulos

#### Processo de Liberação

1. Admin SH3 libera módulo para autarquia (cria em `autarquia_modulo`)
2. Admin da autarquia atribui permissões a usuários (cria em `usuario_modulo_permissao`)
3. Usuário passa a ver o módulo na interface

#### Constraint de Integridade

```sql
-- Uma permissão só pode existir se o módulo está liberado para a autarquia
FOREIGN KEY (autarquia_id, modulo_id)
REFERENCES autarquia_modulo(autarquia_id, modulo_id)
```

### 5. Soft Deletes

O sistema usa "soft deletes" através do campo `ativo`:

- `ativo = false`: Registro desativado (invisível)
- `ativo = true`: Registro ativo (visível)

**Vantagens:**
- Preserva histórico
- Permite auditoria
- Permite reativação

---

## Queries Comuns

### 1. Buscar Usuários de uma Autarquia

```sql
SELECT u.*
FROM users u
INNER JOIN usuario_autarquia ua ON u.id = ua.user_id
WHERE ua.autarquia_id = :autarquia_id
  AND ua.ativo = true
  AND u.is_active = true;
```

**Eloquent:**
```php
$autarquia->usersAtivos()->get();
```

---

### 2. Buscar Módulos Disponíveis para Usuário

```sql
SELECT DISTINCT m.*
FROM modulos m
INNER JOIN autarquia_modulo am ON m.id = am.modulo_id
INNER JOIN usuario_modulo_permissao ump ON m.id = ump.modulo_id
  AND am.autarquia_id = ump.autarquia_id
WHERE ump.user_id = :user_id
  AND ump.autarquia_id = :autarquia_id
  AND ump.ativo = true
  AND am.ativo = true
  AND m.ativo = true
  AND ump.permissao_leitura = true;
```

**Eloquent:**
```php
$user->getModulosDisponiveis($autarquiaId);
```

---

### 3. Verificar Permissão de Usuário em Módulo

```sql
SELECT
  permissao_leitura,
  permissao_escrita,
  permissao_exclusao,
  permissao_admin
FROM usuario_modulo_permissao
WHERE user_id = :user_id
  AND modulo_id = :modulo_id
  AND autarquia_id = :autarquia_id
  AND ativo = true;
```

**Eloquent:**
```php
$user->podeLerModulo($moduloId, $autarquiaId);
```

---

### 4. Listar Módulos Liberados para Autarquia

```sql
SELECT m.*
FROM modulos m
INNER JOIN autarquia_modulo am ON m.id = am.modulo_id
WHERE am.autarquia_id = :autarquia_id
  AND am.ativo = true
  AND m.ativo = true
ORDER BY m.nome;
```

**Eloquent:**
```php
$autarquia->modulosAtivos()->get();
```

---

### 5. Buscar Autarquias do Usuário

```sql
SELECT a.*, ua.role, ua.is_admin, ua.is_default
FROM autarquias a
INNER JOIN usuario_autarquia ua ON a.id = ua.autarquia_id
WHERE ua.user_id = :user_id
  AND ua.ativo = true
  AND a.ativo = true
ORDER BY ua.is_default DESC, a.nome;
```

**Eloquent:**
```php
$user->autarquiasAtivas()->get();
```

---

### 6. Relatório de Permissões por Usuário

```sql
SELECT
  u.name as usuario,
  a.nome as autarquia,
  m.nome as modulo,
  ump.permissao_leitura,
  ump.permissao_escrita,
  ump.permissao_exclusao,
  ump.permissao_admin
FROM usuario_modulo_permissao ump
INNER JOIN users u ON ump.user_id = u.id
INNER JOIN autarquias a ON ump.autarquia_id = a.id
INNER JOIN modulos m ON ump.modulo_id = m.id
WHERE ump.ativo = true
  AND u.is_active = true
  AND a.ativo = true
  AND m.ativo = true
ORDER BY u.name, a.nome, m.nome;
```

---

### 7. Módulos Mais Utilizados (por Permissões)

```sql
SELECT
  m.nome,
  COUNT(DISTINCT ump.user_id) as total_usuarios,
  COUNT(DISTINCT ump.autarquia_id) as total_autarquias
FROM modulos m
LEFT JOIN usuario_modulo_permissao ump ON m.id = ump.modulo_id
WHERE m.ativo = true
  AND (ump.ativo = true OR ump.ativo IS NULL)
GROUP BY m.id, m.nome
ORDER BY total_usuarios DESC;
```

---

### 8. Auditoria de Liberações Recentes

```sql
SELECT
  a.nome as autarquia,
  m.nome as modulo,
  am.data_liberacao,
  am.ativo
FROM autarquia_modulo am
INNER JOIN autarquias a ON am.autarquia_id = a.id
INNER JOIN modulos m ON am.modulo_id = m.id
WHERE am.data_liberacao >= NOW() - INTERVAL '30 days'
ORDER BY am.data_liberacao DESC;
```

---

## Migrações e Evolução do Schema

### Ordem de Execução das Migrations

1. `create_users_table` - Tabela base de usuários
2. `create_cache_table` - Sistema de cache
3. `create_jobs_table` - Filas de trabalho
4. `add_is_superadmin_to_users_table` - Campo superadmin
5. `create_personal_access_tokens_table` - Tokens Sanctum
6. `add_role_and_cpf_to_users_table` - Campos role e CPF
7. `add_is_active_table` - Campo is_active
8. `create_autarquias_table` - Tabela de autarquias
9. `create_modulos_table` - Tabela de módulos
10. `add_autarquia_id_to_users_table` - FK autarquia (temporária)
11. `create_autarquia_modulo_table` - Pivot autarquia-módulo
12. `create_usuario_modulo_permissao_table` - Permissões
13. `create_usuario_autarquia_table` - Pivot usuário-autarquia (remove autarquia_id)

### Rollback

Para reverter todas as migrations:

```bash
php artisan migrate:rollback --step=13
```

Para resetar completamente:

```bash
php artisan migrate:fresh --seed
```

---

## Considerações de Segurança

### 1. Proteção de Dados Sensíveis

- Senhas: Criptografadas com bcrypt (Laravel Hash)
- Tokens: Hasheados no banco (Sanctum)
- CPF: Armazenado sem formatação (apenas números)

### 2. Prevenção de SQL Injection

- Uso de Eloquent ORM (queries parametrizadas)
- Validação de inputs
- Prepared statements automáticos

### 3. Controle de Acesso

- Middleware de autenticação
- Verificação de permissões em todas as rotas
- Isolamento de dados por autarquia

### 4. Auditoria

- Campos `created_at` e `updated_at` em todas as tabelas
- Campo `data_liberacao` e `data_concessao` para rastreabilidade
- Soft deletes preservam histórico

---

## Backup e Manutenção

### Estratégia de Backup

```bash
# Backup completo
pg_dump -h localhost -U root -d frota > backup_$(date +%Y%m%d).sql

# Backup apenas dados (sem schema)
pg_dump -h localhost -U root -d frota --data-only > backup_data_$(date +%Y%m%d).sql

# Backup apenas schema
pg_dump -h localhost -U root -d frota --schema-only > backup_schema_$(date +%Y%m%d).sql
```

### Restauração

```bash
# Restaurar backup
psql -h localhost -U root -d frota < backup_20251022.sql
```

### Manutenção Regular

```sql
-- Reindexar tabelas
REINDEX TABLE users;
REINDEX TABLE usuario_modulo_permissao;

-- Atualizar estatísticas
ANALYZE users;
ANALYZE usuario_modulo_permissao;

-- Vacuum (limpeza)
VACUUM ANALYZE;
```

---

## Performance e Escalabilidade

### Métricas Atuais

- Tempo médio de query: < 50ms
- Queries por segundo: ~100
- Conexões simultâneas: ~10

### Recomendações para Crescimento

1. **Cache de Queries**
   - Implementar Redis para cache
   - Cachear módulos e autarquias (dados estáticos)

2. **Read Replicas**
   - PostgreSQL replication para leitura
   - Separar queries de leitura/escrita

3. **Particionamento**
   - Particionar `usuario_modulo_permissao` por autarquia_id (> 1M registros)
   - Particionar `sessions` por last_activity

4. **Índices Adicionais**
   - Índices parciais para queries específicas
   - Índices GIN para buscas full-text (futuro)

---

## Conclusão

A modelagem do banco de dados do Auth Suite foi projetada para:

- ✅ Suportar multi-tenancy (multi-autarquia)
- ✅ Controle de acesso granular
- ✅ Escalabilidade
- ✅ Auditoria e rastreabilidade
- ✅ Flexibilidade para crescimento
- ✅ Performance otimizada

O schema está pronto para suportar o crescimento do sistema e a adição de novos módulos sem necessidade de grandes refatorações.

---

**Documento mantido por:** Equipe de Desenvolvimento
**Última atualização:** 22 de Outubro de 2025
**Versão do Schema:** 2.0
