# Modelagem de Dados - Sistema de Controle de Acesso Granular

## 📋 Visão Geral

Sistema de controle de acesso baseado em **Autarquias** e **Módulos** para ambiente Laravel/PostgreSQL com Docker.

### Principais Características:
- ✅ Isolamento de dados por autarquia
- ✅ Controle granular de permissões por usuário/módulo/autarquia
- ✅ Módulos compartilhados entre autarquias
- ✅ Sistema de permissões detalhado (leitura, escrita, exclusão, admin)
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
Tabela de usuários com adição do campo `autarquia_id`.

| Campo Adicionado | Tipo | Descrição |
|------------------|------|-----------|
| autarquia_id | BIGINT (FK) | Referência à autarquia do usuário |

**Chave Estrangeira:**
- `autarquia_id` → `autarquias(id)` ON DELETE RESTRICT

**Índice:** autarquia_id

---

#### 4. **autarquia_modulo**
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

#### 5. **usuario_modulo_permissao**
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
3. **2025_10_16_150002_add_autarquia_id_to_users_table.php**
4. **2025_10_16_150003_create_autarquia_modulo_table.php**
5. **2025_10_16_150004_create_usuario_modulo_permissao_table.php**

## 🌱 Seeders

### ControlePorAutarquiaSeeder

Popula o banco com dados de teste baseados no seguinte cenário:

#### Autarquias:
- **SH3 - Suporte:** Autarquia especial para equipe de suporte (criada automaticamente)
- **Autarquia X:** Prefeitura Municipal X
- **Autarquia Y:** Prefeitura Municipal Y
- **Autarquia Z:** Prefeitura Municipal Z

#### Módulos:
- **Módulo 1:** Gestão de Frota
- **Módulo 2:** Recursos Humanos
- **Módulo 3:** Almoxarifado
- **Módulo 4:** Contabilidade

#### Usuários:
| Nome | Email | Autarquia | Role | Módulos com Permissão | Nível |
|------|-------|-----------|------|----------------------|-------|
| Super Admin | admin@empresa.com | SH3 - Suporte | superadmin | Todos | Acesso Total |
| João Silva | joao.silva@prefeiturax.gov.br | X | gestor | Gestão de Frota | Admin |
| Maria Oliveira | maria.oliveira@prefeiturax.gov.br | X | gestor | Recursos Humanos | Admin |
| Pedro Santos | pedro.santos@prefeituray.gov.br | Y | gestor | Gestão de Frota, Almoxarifado | Admin |
| Ana Costa | ana.costa@prefeituray.gov.br | Y | user | Contabilidade | Leitura/Escrita |
| Carlos Ferreira | carlos.ferreira@prefeituraz.gov.br | Z | admin | Gestão de Frota, Contabilidade | Admin |

#### Liberações de Módulos:
- **Autarquia X:** Gestão de Frota, RH, Almoxarifado
- **Autarquia Y:** Todos os módulos
- **Autarquia Z:** Gestão de Frota, Contabilidade

**Senhas padrão:**
- Super Admin: `admin123` (configurável via `.env` - `SUPERADMIN_PASSWORD`)
- Demais usuários: `senha123`

---

## 🚀 Instruções de Execução

### 1. Verificar Configuração Docker

O arquivo [docker-compose.yaml](docker-compose.yaml) já está configurado corretamente com:
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
SELECT * FROM autarquia_modulo;
SELECT * FROM usuario_modulo_permissao;

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
         │    users    │          │
         ├─────────────┤          │
         │ id (PK)     │          │
         │ name        │          │
         │ email       │          │
         │ cpf         │          │
         │ password    │          │
         │autarquia_id │          │
         │ role        │          │
         │ is_active   │          │
         └──────┬──────┘          │
                │                 │
                │  ┌──────────────┴───────────────────────────────┐
                └──┤   usuario_modulo_permissao (pivot)           │
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

Todas as chaves estrangeiras utilizam **ON DELETE RESTRICT** para evitar exclusões acidentais de:
- Autarquias que possuem usuários
- Módulos que possuem permissões
- Registros relacionados em tabelas pivot

---

## 📝 Observações Importantes

### 1. Sistema de Permissões Granular
O sistema implementa 4 níveis de permissão:
- **Leitura:** Visualizar dados do módulo
- **Escrita:** Criar e editar dados
- **Exclusão:** Remover dados
- **Admin:** Administrador do módulo (pode gerenciar outros usuários)

### 2. Validação de Integridade
A tabela `usuario_modulo_permissao` possui uma constraint que garante que um usuário só pode ter permissão em um módulo que está liberado para sua autarquia através da foreign key composta `(autarquia_id, modulo_id)`.

### 3. Índices de Performance
Todos os campos frequentemente utilizados em queries possuem índices:
- Chaves estrangeiras
- Campos de status (ativo)
- Campos de busca (nome)
- Combinações úteis (user_id + ativo, autarquia_id + modulo_id)

### 4. Isolamento de Dados
Embora o modelo atual utilize um único schema do PostgreSQL, a estrutura está preparada para futura implementação de schemas separados por autarquia, mantendo a integridade através das chaves estrangeiras.

---

## 🔄 Próximos Passos Sugeridos

1. **Criar Models Eloquent** com relacionamentos
2. **Implementar Middleware** para verificação de permissões
3. **Criar Policies** para autorização por módulo
4. **Implementar API REST** para gestão de permissões
5. **Criar Interface** para administração de usuários e permissões
6. **Implementar Logs** de auditoria de acessos
7. **Considerar Multi-tenancy** com schemas separados por autarquia

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
SELECT 'autarquia_modulo', COUNT(*) FROM autarquia_modulo
UNION ALL
SELECT 'usuario_modulo_permissao', COUNT(*) FROM usuario_modulo_permissao;
"
```

**Resultado esperado:**
- autarquias: 4 registros (1 SH3 - Suporte + 3 clientes)
- modulos: 4 registros
- users: 6 registros (1 superadmin + 5 usuários de teste)
- autarquia_modulo: 9 registros
- usuario_modulo_permissao: 7 registros

---

## 🔐 Autarquia SH3 - Suporte

A autarquia **SH3 - Suporte** é uma autarquia especial criada automaticamente pelo sistema para abrigar usuários da equipe de suporte.

### Características:
- ✅ Criada automaticamente ao executar o `SuperAdminSeeder`
- ✅ Usuários com role `superadmin` são vinculados a esta autarquia
- ✅ Usuários superadmin têm acesso total a todos os módulos de todas as autarquias
- ✅ Permite que a equipe de suporte faça implantação e intervenções nos sistemas dos clientes

### Configuração via .env:
```env
SUPERADMIN_NAME="Super Admin"
SUPERADMIN_EMAIL=admin@empresa.com
SUPERADMIN_PASSWORD=admin123
SUPERADMIN_CPF=00000000000
```

### Uso:
- Para criar novos usuários de suporte, crie-os com `role: superadmin` e `autarquia_id` da SH3
- Superadmins não precisam de permissões específicas nos módulos - eles têm acesso total automaticamente

---

📌 **Documentação criada em:** 16/10/2025
