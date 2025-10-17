# Modelagem de Dados - Sistema de Controle de Acesso Granular

## 📋 Visão Geral

Sistema de controle de acesso baseado em **Autarquias** e **Módulos** para ambiente Laravel/PostgreSQL com Docker.

### Principais Características:
- ✅ Isolamento de dados por autarquia
- ✅ **Relacionamento N:N entre usuários e autarquias** (um usuário pode pertencer a múltiplas autarquias)
- ✅ Controle granular de permissões por usuário/módulo/autarquia
- ✅ Módulos compartilhados entre autarquias
- ✅ Sistema de permissões detalhado (leitura, escrita, exclusão, admin)
- ✅ Contexto de autarquia ativa por usuário
- ✅ Integridade referencial com RESTRICT para evitar exclusões acidentais

## 🗄️ Estrutura do Banco de Dados

### Tabelas Criadas

#### 1. **autarquias**
Armazena as autarquias (clientes) do sistema.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | BIGINT (PK) | Identificador único (auto-incremento) |
| nome | VARCHAR(255) | Nome da autarquia (UNIQUE) |
| ativo | BOOLEAN | Status da autarquia |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Data de atualização |

**Índices:** nome, ativo

---

#### 2. **modulos**
Armazena os módulos disponíveis no sistema.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | BIGINT (PK) | Identificador único (auto-incremento) |
| nome | VARCHAR(255) | Nome do módulo (UNIQUE) |
| descricao | TEXT | Descrição do módulo |
| icone | VARCHAR(100) | Ícone do módulo |
| ativo | BOOLEAN | Status do módulo |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Data de atualização |

**Índices:** nome, ativo

---

#### 3. **users** (atualizada)
Tabela de usuários com campo `autarquia_ativa_id` para contexto atual.

| Campo Relevante | Tipo | Descrição |
|-----------------|------|-----------|
| id | BIGINT (PK) | Identificador único |
| name | VARCHAR(255) | Nome do usuário |
| email | VARCHAR(255) | Email (UNIQUE) |
| password | VARCHAR(255) | Senha criptografada |
| cpf | VARCHAR(11) | CPF (UNIQUE) |
| role | VARCHAR(50) | Role global do usuário |
| autarquia_ativa_id | BIGINT (FK) | **Autarquia ativa no contexto atual** |
| is_active | BOOLEAN | Status do usuário |
| is_superadmin | BOOLEAN | Flag de superadmin (Suporte SH3) |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Data de atualização |

**⚠️ IMPORTANTE:**
- O campo `autarquia_id` foi **REMOVIDO** (relacionamento 1:N descontinuado)
- Agora usa relacionamento N:N através da tabela `usuario_autarquia`
- `autarquia_ativa_id` armazena qual autarquia o usuário está usando no momento

**Chave Estrangeira:**
- `autarquia_ativa_id` → `autarquias(id)` ON DELETE SET NULL

**Índice:** autarquia_ativa_id

---

#### 4. **usuario_autarquia** 🆕
Tabela pivot para relacionamento N:N entre usuários e autarquias.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | BIGINT (PK) | Identificador único |
| user_id | BIGINT (FK) | Referência ao usuário |
| autarquia_id | BIGINT (FK) | Referência à autarquia |
| role | VARCHAR(50) | Role específica para esta autarquia |
| is_admin | BOOLEAN | Admin desta autarquia? |
| is_default | BOOLEAN | **Autarquia padrão/inicial do usuário** |
| ativo | BOOLEAN | Status do vínculo |
| data_vinculo | TIMESTAMP | Data de vinculação |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Data de atualização |

**Chave Única:** (user_id, autarquia_id)

**Chaves Estrangeiras:**
- `user_id` → `users(id)` ON DELETE CASCADE
- `autarquia_id` → `autarquias(id)` ON DELETE CASCADE

**Índices:** user_id, autarquia_id, (user_id, autarquia_id)

**Características:**
- ✅ Permite que um usuário pertença a múltiplas autarquias
- ✅ Cada vínculo pode ter role e is_admin específicos
- ✅ Campo `is_default` indica a autarquia padrão do usuário
- ✅ Campo `ativo` permite desativar vínculos sem excluí-los

---

#### 5. **autarquia_modulo**
Tabela de relacionamento entre autarquias e módulos (módulos liberados para cada autarquia).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| autarquia_id | BIGINT (PK, FK) | Referência à autarquia |
| modulo_id | BIGINT (PK, FK) | Referência ao módulo |
| data_liberacao | TIMESTAMP | Data de liberação do módulo |
| ativo | BOOLEAN | Status da liberação |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Data de atualização |

**Chave Primária Composta:** (autarquia_id, modulo_id)

**Chaves Estrangeiras:**
- `autarquia_id` → `autarquias(id)` ON DELETE RESTRICT
- `modulo_id` → `modulos(id)` ON DELETE RESTRICT

**Índices:** autarquia_id, modulo_id, ativo, data_liberacao

---

#### 6. **usuario_modulo_permissao**
Tabela de permissões granulares de usuários nos módulos por autarquia.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| user_id | BIGINT (PK, FK) | Referência ao usuário |
| modulo_id | BIGINT (PK, FK) | Referência ao módulo |
| autarquia_id | BIGINT (PK, FK) | Referência à autarquia |
| permissao_leitura | BOOLEAN | Permissão de leitura |
| permissao_escrita | BOOLEAN | Permissão de escrita/edição |
| permissao_exclusao | BOOLEAN | Permissão de exclusão |
| permissao_admin | BOOLEAN | Permissão de administrador do módulo |
| data_concessao | TIMESTAMP | Data de concessão da permissão |
| ativo | BOOLEAN | Status da permissão |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Data de atualização |

**Chave Primária Composta:** (user_id, modulo_id, autarquia_id)

**Chaves Estrangeiras:**
- `user_id` → `users(id)` ON DELETE RESTRICT
- `modulo_id` → `modulos(id)` ON DELETE RESTRICT
- `autarquia_id` → `autarquias(id)` ON DELETE RESTRICT
- `(autarquia_id, modulo_id)` → `autarquia_modulo(autarquia_id, modulo_id)` ON DELETE RESTRICT
  - ⚠️ **Importante:** Garante que só pode conceder permissão em módulo liberado para a autarquia

**Índices:** user_id, modulo_id, autarquia_id, ativo, (user_id, ativo), (autarquia_id, modulo_id)

---

## 🔧 Migrations Criadas

As seguintes migrations foram criadas na ordem correta de execução:

1. **2025_10_16_150000_create_autarquias_table.php**
2. **2025_10_16_150001_create_modulos_table.php**
3. **2025_10_16_150002_add_autarquia_id_to_users_table.php** *(legado - será substituído)*
4. **2025_10_16_150003_create_autarquia_modulo_table.php**
5. **2025_10_16_150004_create_usuario_modulo_permissao_table.php**
6. **2025_10_17_000001_create_usuario_autarquia_table.php** 🆕
   - Cria tabela pivot `usuario_autarquia`
   - Adiciona campo `autarquia_ativa_id` em `users`
   - Migra dados existentes de `users.autarquia_id` para a tabela pivot
   - **Remove o campo `autarquia_id` de `users`**

## 🌱 Seeders

### SuperAdminSeeder

Cria o superadmin do sistema (equipe de suporte SH3).

**Funcionalidade:**
- Cria autarquia "SH3 - Suporte"
- Cria usuário superadmin com acesso total
- Vincula o superadmin à autarquia SH3 via tabela pivot
- Define a autarquia SH3 como `autarquia_ativa_id`

**Configuração via .env:**
```env
SUPERADMIN_NAME="Super Admin"
SUPERADMIN_EMAIL=admin@empresa.com
SUPERADMIN_PASSWORD=admin123
SUPERADMIN_CPF=00000000000
```

### ModulosSeeder

Cria os módulos do sistema:
- **Módulo 1:** Gestão de Frota
- **Módulo 2:** Recursos Humanos
- **Módulo 3:** Almoxarifado
- **Módulo 4:** Contabilidade

### ControlePorAutarquiaSeeder

Popula o banco com dados de teste baseados no seguinte cenário:

#### Autarquias:
- **Autarquia X:** Prefeitura Municipal X
- **Autarquia Y:** Prefeitura Municipal Y
- **Autarquia Z:** Prefeitura Municipal Z

#### Usuários:
| Nome | Email | Autarquias | Role | Módulos com Permissão | Nível |
|------|-------|-----------|------|----------------------|-------|
| João Silva | joao.silva@prefeiturax.gov.br | X (default) | gestor | Gestão de Frota | Admin |
| Maria Oliveira | maria.oliveira@prefeiturax.gov.br | X (default) | gestor | Recursos Humanos | Admin |
| Pedro Santos | pedro.santos@prefeituray.gov.br | Y (default) | gestor | Gestão de Frota, Almoxarifado | Admin |
| Ana Costa | ana.costa@prefeituray.gov.br | Y (default) | user | Contabilidade | Leitura/Escrita |
| Carlos Ferreira | carlos.ferreira@prefeituraz.gov.br | Z (default) | admin | Gestão de Frota, Contabilidade | Admin |

**💡 Nota:** Todos os usuários estão vinculados a apenas uma autarquia neste exemplo, mas o sistema suporta vínculos múltiplos.

#### Liberações de Módulos:
- **Autarquia X:** Gestão de Frota, RH, Almoxarifado
- **Autarquia Y:** Todos os módulos
- **Autarquia Z:** Gestão de Frota, Contabilidade

**Senhas padrão:**
- Super Admin: `admin123` (configurável via `.env`)
- Demais usuários: `senha123`

---

## 🚀 Instruções de Execução

### 1. Verificar Configuração Docker

O arquivo [docker-compose.yaml](../docker-compose.yaml) já está configurado corretamente com:
- PostgreSQL 17
- Execução automática de migrations
- Execução automática de seeders

**Não é necessário modificar a configuração Docker atual.**

### 2. Executar Migrations e Seeders

#### Opção A: Via Docker (Recomendado)
```bash
# Parar os containers
docker compose down

# Limpar os volumes (ATENÇÃO: Apaga todos os dados)
docker compose down -v

# Subir os containers (migrations e seeders executam automaticamente)
docker compose up -d
```

#### Opção B: Manualmente (se necessário)
```bash
# Acessar o container
docker exec -it gestao_frota_app_local bash

# Executar migrations
php artisan migrate

# Executar seeders
php artisan db:seed

# Ou executar migration e seed juntos (limpa tudo)
php artisan migrate:fresh --seed
```

### 3. Verificar Dados no Banco

```bash
# Acessar o PostgreSQL
docker exec -it gestao_frota_db_local psql -U root -d frota

# Consultas úteis
SELECT * FROM autarquias;
SELECT * FROM modulos;
SELECT * FROM users;
SELECT * FROM usuario_autarquia;  -- NOVA TABELA
SELECT * FROM autarquia_modulo;
SELECT * FROM usuario_modulo_permissao;

# Verificar vínculos de um usuário com autarquias
SELECT
    u.name,
    a.nome as autarquia,
    ua.role,
    ua.is_admin,
    ua.is_default,
    ua.ativo
FROM usuario_autarquia ua
JOIN users u ON ua.user_id = u.id
JOIN autarquias a ON ua.autarquia_id = a.id
WHERE u.email = 'joao.silva@prefeiturax.gov.br';

# Verificar permissões de um usuário
SELECT
    u.name,
    m.nome as modulo,
    a.nome as autarquia,
    ump.permissao_leitura,
    ump.permissao_escrita,
    ump.permissao_exclusao,
    ump.permissao_admin
FROM usuario_modulo_permissao ump
JOIN users u ON ump.user_id = u.id
JOIN modulos m ON ump.modulo_id = m.id
JOIN autarquias a ON ump.autarquia_id = a.id
WHERE u.email = 'joao.silva@prefeiturax.gov.br';
```

---

## 📊 Diagrama ER Atualizado

```
┌─────────────────┐         ┌──────────────────┐
│   autarquias    │         │     modulos      │
├─────────────────┤         ├──────────────────┤
│ id (PK)         │         │ id (PK)          │
│ nome (UNIQUE)   │         │ nome (UNIQUE)    │
│ ativo           │         │ descricao        │
└────────┬────────┘         │ icone            │
         │                  │ ativo            │
         │                  └────────┬─────────┘
         │                           │
         │    ┌──────────────────────┴──────────────────────┐
         │    │                                              │
         │    │     ┌────────────────────────────────┐      │
         └────┼─────┤   autarquia_modulo (pivot)     ├──────┘
              │     ├────────────────────────────────┤
              │     │ autarquia_id (PK, FK)          │
              │     │ modulo_id (PK, FK)             │
              │     │ data_liberacao                 │
              │     │ ativo                          │
              │     └─────────────┬──────────────────┘
              │                   │
         ┌────┴────────┐          │
         │    users    │◄─────────┼────────────────┐
         ├─────────────┤          │                │
         │ id (PK)     │          │                │
         │ name        │          │                │
         │ email       │          │                │
         │ cpf         │          │                │
         │ password    │          │                │
         │ autarquia_  │          │                │
         │   ativa_id  │──────────┘                │
         │ role        │                           │
         │ is_active   │                           │
         │is_superadmin│                           │
         └──────┬──────┘                           │
                │                                  │
                │  🆕 N:N via usuario_autarquia    │
                │  ┌───────────────────────────────┘
                └──┤ usuario_autarquia (pivot) 🆕 │
                   ├───────────────────────────────┤
                   │ id (PK)                       │
                   │ user_id (FK)                  │
                   │ autarquia_id (FK)             │
                   │ role                          │
                   │ is_admin                      │
                   │ is_default                    │
                   │ ativo                         │
                   └───────────────┬───────────────┘
                                   │
                   ┌───────────────┴───────────────────────────────┐
                   │   usuario_modulo_permissao (pivot)           │
                   ├──────────────────────────────────────────────┤
                   │ user_id (PK, FK)                             │
                   │ modulo_id (PK, FK)                           │
                   │ autarquia_id (PK, FK)                        │
                   │ permissao_leitura                            │
                   │ permissao_escrita                            │
                   │ permissao_exclusao                           │
                   │ permissao_admin                              │
                   │ data_concessao                               │
                   │ ativo                                        │
                   └──────────────────────────────────────────────┘
```

---

## 🔐 Integridade Referencial

Todas as chaves estrangeiras utilizam **ON DELETE RESTRICT** ou **CASCADE** conforme apropriado:
- `usuario_autarquia`: CASCADE (se usuário ou autarquia for excluído, remove vínculos)
- `autarquia_modulo`: RESTRICT (não permite excluir autarquia/módulo com vínculos ativos)
- `usuario_modulo_permissao`: RESTRICT (não permite excluir registros com permissões ativas)

---

## 📝 Observações Importantes

### 1. Relacionamento N:N entre Usuários e Autarquias

**✨ Nova Funcionalidade:**
- Um usuário pode estar vinculado a **múltiplas autarquias**
- Cada vínculo pode ter role e is_admin específicos
- Campo `autarquia_ativa_id` em `users` indica qual autarquia está ativa no momento
- Campo `is_default` em `usuario_autarquia` indica a autarquia padrão

**Casos de Uso:**
- Usuário que trabalha em múltiplas prefeituras
- Consultor que presta serviço para vários clientes
- Administrador que gerencia múltiplas autarquias

**Como Trocar de Autarquia:**
- Frontend: Use o endpoint `/user/switch-autarquia`
- Backend: Método `User::trocarAutarquia($autarquiaId)`
- Atualiza `autarquia_ativa_id` automaticamente

### 2. Sistema de Permissões Granular
O sistema implementa 4 níveis de permissão:
- **Leitura:** Visualizar dados do módulo
- **Escrita:** Criar e editar dados
- **Exclusão:** Remover dados
- **Admin:** Administrador do módulo (pode gerenciar outros usuários)

### 3. Validação de Integridade
A tabela `usuario_modulo_permissao` possui uma constraint que garante que um usuário só pode ter permissão em um módulo que está liberado para sua autarquia através da foreign key composta `(autarquia_id, modulo_id)`.

### 4. Índices de Performance
Todos os campos frequentemente utilizados em queries possuem índices:
- Chaves estrangeiras
- Campos de status (ativo)
- Campos de busca (nome)
- Combinações úteis (user_id + ativo, autarquia_id + modulo_id, user_id + autarquia_id)

### 5. Modo Suporte (Superadmin)

**Usuários Superadmin (SH3):**
- Têm acesso a **todas as autarquias** sem necessidade de vínculo explícito
- Podem assumir contexto de qualquer autarquia via endpoint `/support/assume-context`
- Flag `is_superadmin = true` concede privilégios especiais
- Vinculados à autarquia "SH3 - Suporte" por padrão

**Endpoints de Suporte:**
- `POST /support/assume-context` - Assume contexto de uma autarquia
- `POST /support/exit-context` - Retorna ao contexto original
- `GET /user/autarquias` - Lista autarquias disponíveis

---

## 🔄 Mudanças em Relação à Versão Anterior

### ❌ Removido:
- Campo `autarquia_id` da tabela `users`
- Relacionamento 1:N entre User e Autarquia

### ✅ Adicionado:
- Tabela `usuario_autarquia` (pivot N:N)
- Campo `autarquia_ativa_id` em `users` (contexto atual)
- Campo `is_default` em `usuario_autarquia` (autarquia padrão)
- Suporte a múltiplas autarquias por usuário

### 🔧 Modificado:
- Models `User` e `Autarquia` agora usam `belongsToMany`
- Controllers adaptados para nova estrutura
- Seeders atualizados para usar tabela pivot

---

## ✅ Validação

Para validar que tudo foi criado corretamente:

```bash
# Verificar se as tabelas foram criadas
docker exec -it gestao_frota_db_local psql -U root -d frota -c "\dt"

# Verificar quantidade de registros
docker exec -it gestao_frota_db_local psql -U root -d frota -c "
SELECT
    'autarquias' as tabela, COUNT(*) as registros FROM autarquias
UNION ALL
SELECT 'modulos', COUNT(*) FROM modulos
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'usuario_autarquia', COUNT(*) FROM usuario_autarquia
UNION ALL
SELECT 'autarquia_modulo', COUNT(*) FROM autarquia_modulo
UNION ALL
SELECT 'usuario_modulo_permissao', COUNT(*) FROM usuario_modulo_permissao;
"
```

**Resultado esperado:**
- autarquias: 4 registros (1 SH3 - Suporte + 3 clientes)
- modulos: 4 registros
- users: 6 registros (1 superadmin + 5 usuários de teste)
- usuario_autarquia: 6 registros (1 vínculo por usuário) 🆕
- autarquia_modulo: 9 registros
- usuario_modulo_permissao: 7 registros

---

## 🔐 Autarquia SH3 - Suporte

A autarquia **SH3 - Suporte** é uma autarquia especial criada automaticamente pelo sistema para abrigar usuários da equipe de suporte.

### Características:
- ✅ Criada automaticamente ao executar o `SuperAdminSeeder`
- ✅ Usuários com `is_superadmin = true` têm acesso total
- ✅ Superadmins podem assumir contexto de qualquer autarquia
- ✅ Não requer vínculo explícito na tabela `usuario_autarquia` para acessar outras autarquias
- ✅ Permite que a equipe de suporte faça implantação e intervenções nos sistemas dos clientes

### Uso:
- Para criar novos usuários de suporte, crie-os com `is_superadmin: true`
- Vincule-os à autarquia SH3 via tabela pivot
- Superadmins não precisam de permissões específicas nos módulos - eles têm acesso total automaticamente

---

📌 **Documentação atualizada em:** 17/10/2025
📌 **Última revisão:** Implementação do relacionamento N:N entre usuários e autarquias
