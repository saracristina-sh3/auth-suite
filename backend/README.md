# Auth Suite - Backend API

API RESTful construída com Laravel 11 para gerenciamento de autenticação, autarquias (entidades municipais), módulos e permissões.

## Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias](#tecnologias)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Banco de Dados](#banco-de-dados)
- [API Endpoints](#api-endpoints)
- [Controllers](#controllers)
- [Models](#models)
- [Migrations](#migrations)
- [Services e Traits](#services-e-traits)
- [Autenticação](#autenticação)
- [Modo Suporte](#modo-suporte)
- [Permissões](#permissões)
- [Padrões de Resposta](#padrões-de-resposta)

---

## Sobre o Projeto

O **Auth Suite Backend** é uma API robusta que gerencia:

- **Autenticação** com JWT tokens e refresh tokens
- **Múltiplas autarquias** por usuário com sistema pivot
- **Módulos** ativáveis por autarquia
- **Permissões granulares** por usuário/módulo/autarquia
- **Modo suporte** para superadmins assumirem contexto de autarquias
- **Sessões Laravel** para controle de autarquia ativa

### Características Principais

- Laravel 11 com PHP 8.2+
- Laravel Sanctum para autenticação
- Sistema de refresh tokens personalizado
- API RESTful com padrões consistentes
- Migrations organizadas cronologicamente
- Traits reutilizáveis (ApiResponses, CreatesTokens)
- Telescope para debugging (ambiente de desenvolvimento)

---

## Tecnologias

- **Framework**: Laravel 11.x
- **PHP**: ^8.2
- **Banco de Dados**: MySQL 8.0
- **Autenticação**: Laravel Sanctum
- **API**: RESTful
- **Debugging**: Laravel Telescope
- **Testing**: PHPUnit

---

## Estrutura de Pastas

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/              # Controllers da API
│   │   │       ├── AuthController.php
│   │   │       ├── UserController.php
│   │   │       ├── AutarquiaController.php
│   │   │       ├── ModulosController.php
│   │   │       ├── AutarquiaModuloController.php
│   │   │       ├── UserAutarquiaController.php
│   │   │       ├── UsuarioModuloPermissaoController.php
│   │   │       ├── SessionController.php
│   │   │       └── RoleController.php
│   │   └── Middleware/
│   ├── Models/                   # Eloquent Models
│   │   ├── User.php
│   │   ├── Autarquia.php
│   │   ├── Modulo.php
│   │   ├── AutarquiaModulo.php
│   │   └── UsuarioModuloPermissao.php
│   ├── Services/                 # Serviços de negócio
│   │   └── AutarquiaSessionService.php
│   │   └── PermissionService.php 
│   ├── Traits/                   # Traits reutilizáveis
│   │   ├── ApiResponses.php      # Respostas padronizadas
│   │   └── CreatesTokens.php     # Geração de tokens
│   │   └── HandleAutarquias.php  # 
│   │   └── HasCompositePrimaryKey.php # 
│   │   └── PermissionChecks.php # 
│   │   └──PermissionSconpes.php # 
│   └── Providers/
├── config/                       # Arquivos de configuração
│   ├── database.php
│   ├── sanctum.php
│   └── session.php
├── database/
│   ├── migrations/               # Migrações do banco
│   ├── seeders/                  # Seeds para popular BD
│   └── factories/                # Factories para testes
├── routes/
│   ├── api.php                   # Rotas da API
│   └── web.php
├── tests/                        # Testes automatizados
│   ├── Feature/
│   └── Unit/
├── .env.example                  # Exemplo de configuração
├── artisan                       # CLI do Laravel
├── composer.json                 # Dependências PHP
└── README.md
```

---

## Instalação

### Requisitos

- PHP 8.2 ou superior
- Composer
- MySQL 8.0 ou superior
- Node.js (opcional, para assets)

### Passos

```bash
# 1. Clone o repositório
cd backend/

# 2. Instale as dependências
composer install

# 3. Copie o arquivo de ambiente
cp .env.example .env

# 4. Gere a chave da aplicação
php artisan key:generate

# 5. Configure o banco de dados no .env
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=auth_suite
# DB_USERNAME=root
# DB_PASSWORD=

# 6. Execute as migrations
php artisan migrate

# 7. (Opcional) Popule o banco com dados de teste
php artisan db:seed

# 8. Inicie o servidor
php artisan serve
```

A API estará disponível em: `http://localhost:8000/api`

---

## Configuração

### Variáveis de Ambiente (.env)

```env
# Aplicação
APP_NAME="Auth Suite"
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://localhost:8000

# Banco de Dados
DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=auth_suite
DB_USERNAME=root
DB_PASSWORD=

# Sanctum (Tokens)
SANCTUM_STATEFUL_DOMAINS=localhost,127.0.0.1,localhost:5173
SESSION_DRIVER=database

# JWT Token Settings (personalizado)
JWT_SECRET=sua_chave_secreta
JWT_EXPIRATION=60                 # Access token: 1 hora
REFRESH_TOKEN_EXPIRATION=10080    # Refresh token: 7 dias
```

### CORS

Configure no arquivo `config/cors.php`:

```php
'paths' => ['api/*', 'sanctum/csrf-cookie', '/login', '/logout', '/me', '/users'],
'allowed_origins' => ['http://localhost:3000',
        'http://127.0.0.1:3000',
        'https://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:5173',],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

---

## Banco de Dados

### Diagrama ER

```
users
├── id (PK)
├── name
├── email (unique)
├── cpf (unique)
├── password
├── role (user|admin|superadmin)
├── is_superadmin (boolean)
├── is_active (boolean)
├── autarquia_preferida_id (FK -> autarquias.id)
├── refresh_token (nullable)
├── refresh_token_expires_at (nullable)
├── created_at
└── updated_at

usuario_autarquia (Pivot)
├── id (PK)
├── usuario_id (FK -> users.id)
├── autarquia_id (FK -> autarquias.id)
├── role (user|admin)
├── is_admin (boolean)
├── is_default (boolean)  ← Define autarquia_preferida_id
├── ativo (boolean)
├── created_at
└── updated_at

autarquias
├── id (PK)
├── nome
├── cnpj (unique)
├── cidade
├── estado
├── ativo (boolean)
├── created_at
└── updated_at

modulos
├── id (PK)
├── nome
├── slug (unique)
├── descricao
├── ativo (boolean)
├── created_at
└── updated_at

autarquia_modulo (Pivot)
├── id (PK)
├── autarquia_id (FK -> autarquias.id)
├── modulo_id (FK -> modulos.id)
├── ativo (boolean)
├── data_ativacao
├── created_at
└── updated_at

usuario_modulo_permissao
├── id (PK)
├── usuario_id (FK -> users.id)
├── modulo_id (FK -> modulos.id)
├── autarquia_id (FK -> autarquias.id)
├── view (boolean)
├── create (boolean)
├── edit (boolean)
├── delete (boolean)
├── created_at
└── updated_at
```

### Sessões Laravel

```
sessions
├── id (PK)
├── user_id (FK)
├── payload (text)        ← Contém: autarquia_ativa_id, support_mode
├── last_activity
└── ...
```

---

## API Endpoints

### Base URL

```
http://localhost:3000/api
```

### Rotas Públicas

| Método | Endpoint       | Descrição          |
|--------|----------------|--------------------|
| POST   | `/login`       | Login de usuário   |
| POST   | `/register`    | Registrar usuário  |

### Rotas Autenticadas

Todas as rotas abaixo requerem header: `Authorization: Bearer {token}`

#### Autenticação

| Método | Endpoint                    | Descrição                       |
|--------|-----------------------------|---------------------------------|
| POST   | `/logout`                   | Logout do usuário               |
| POST   | `/refresh`                  | Renovar access token            |
| GET    | `/me`                       | Dados do usuário autenticado    |
| GET    | `/user/autarquias`          | Listar autarquias do usuário    |
| POST   | `/user/switch-autarquia`    | Trocar autarquia ativa          |

#### Modo Suporte (Superadmin)

| Método | Endpoint                     | Descrição                          |
|--------|------------------------------|------------------------------------|
| POST   | `/support/assume-context`    | Assumir contexto de autarquia      |
| POST   | `/support/exit-context`      | Sair do modo suporte               |

#### Sessão (Autarquia Ativa)

| Método | Endpoint                        | Descrição                       |
|--------|---------------------------------|---------------------------------|
| GET    | `/session/active-autarquia`     | Obter autarquia ativa da sessão |
| POST   | `/session/active-autarquia`     | Definir autarquia ativa         |
| DELETE | `/session/active-autarquia`     | Limpar autarquia ativa          |

#### Usuários

| Método | Endpoint                              | Descrição                      |
|--------|---------------------------------------|--------------------------------|
| GET    | `/users`                              | Listar usuários (paginado)     |
| GET    | `/users/stats`                        | Estatísticas de usuários       |
| GET    | `/users/{id}`                         | Obter usuário específico       |
| POST   | `/users`                              | Criar novo usuário             |
| PUT    | `/users/{id}`                         | Atualizar usuário              |
| DELETE | `/users/{id}`                         | Deletar usuário                |
| GET    | `/users/{id}/modulos`                 | Módulos do usuário             |
| GET    | `/users/{id}/autarquias`              | Autarquias do usuário          |
| POST   | `/users/{id}/autarquias/attach`       | Vincular autarquias            |
| POST   | `/users/{id}/autarquias/detach`       | Desvincular autarquias         |
| POST   | `/users/{id}/autarquias/sync`         | Sincronizar autarquias         |
| PUT    | `/users/{id}/active-autarquia`        | Atualizar autarquia ativa      |

#### Autarquias

| Método | Endpoint                             | Descrição                         |
|--------|--------------------------------------|-----------------------------------|
| GET    | `/autarquias`                        | Listar autarquias (paginado)      |
| GET    | `/autarquias/stats`                  | Estatísticas de autarquias        |
| GET    | `/autarquias/{id}`                   | Obter autarquia específica        |
| POST   | `/autarquias`                        | Criar nova autarquia              |
| PUT    | `/autarquias/{id}`                   | Atualizar autarquia               |
| DELETE | `/autarquias/{id}`                   | Deletar autarquia                 |
| GET    | `/autarquias/{id}/modulos`           | Módulos da autarquia              |
| GET    | `/autarquias/{id}/modulos/stats`     | Estatísticas de módulos           |
| GET    | `/autarquias/{id}/usuarios`          | Usuários da autarquia             |

#### Módulos

| Método | Endpoint                    | Descrição                      |
|--------|-----------------------------|--------------------------------|
| GET    | `/modulos`                  | Listar módulos (paginado)      |
| GET    | `/modulos/stats`            | Estatísticas de módulos        |
| GET    | `/modulos/{id}`             | Obter módulo específico        |
| POST   | `/modulos`                  | Criar novo módulo              |
| PUT    | `/modulos/{id}`             | Atualizar módulo               |
| DELETE | `/modulos/{id}`             | Deletar módulo                 |
| GET    | `/modulos/{id}/autarquias`  | Autarquias que têm o módulo    |

#### Liberação de Módulos (Autarquia ↔ Módulo)

| Método | Endpoint                                       | Descrição                          |
|--------|------------------------------------------------|------------------------------------|
| GET    | `/autarquia-modulo`                            | Listar liberações                  |
| PUT    | `/autarquia-modulo/bulk`                       | Atualizar múltiplas liberações     |
| PUT    | `/autarquia-modulo/{autarquiaId}/{moduloId}`   | Atualizar liberação específica     |

#### Permissões (Usuário ↔ Módulo ↔ Autarquia)

| Método | Endpoint                                               | Descrição                        |
|--------|--------------------------------------------------------|----------------------------------|
| GET    | `/permissoes`                                          | Listar permissões                |
| POST   | `/permissoes`                                          | Criar permissão                  |
| POST   | `/permissoes/bulk`                                     | Criar múltiplas permissões       |
| GET    | `/permissoes/{userId}/{moduloId}/{autarquiaId}`        | Obter permissão específica       |
| PUT    | `/permissoes/{userId}/{moduloId}/{autarquiaId}`        | Atualizar permissão              |
| DELETE | `/permissoes/{userId}/{moduloId}/{autarquiaId}`        | Deletar permissão                |
| GET    | `/permissoes/check/{userId}/{moduloId}`                | Verificar permissão              |

#### Roles

| Método | Endpoint   | Descrição            |
|--------|------------|----------------------|
| GET    | `/roles`   | Listar roles         |

---

## Controllers

### AuthController.php

**Responsabilidade**: Gerenciar autenticação, login, logout, refresh tokens e modo suporte.

**Principais Métodos**:

- `login(Request $request)` - Autentica usuário e retorna tokens
- `logout(Request $request)` - Invalida tokens
- `refresh(Request $request)` - Renova access token usando refresh token
- `me(Request $request)` - Retorna dados do usuário autenticado
- `assumeAutarquiaContext(Request $request)` - Ativa modo suporte (superadmin)
- `exitAutarquiaContext(Request $request)` - Sai do modo suporte
- `getAutarquias(Request $request)` - Lista autarquias do usuário
- `switchAutarquia(Request $request)` - Troca autarquia ativa

**Traits Utilizados**:
- `ApiResponses` - Respostas padronizadas
- `CreatesTokens` - Geração de JWT e refresh tokens

---

### UserController.php

**Responsabilidade**: CRUD de usuários.

**Principais Métodos**:

- `index(Request $request)` - Lista usuários com paginação
- `show(User $user)` - Exibe usuário específico
- `store(Request $request)` - Cria novo usuário
- `update(Request $request, User $user)` - Atualiza usuário
- `destroy(User $user)` - Deleta usuário
- `stats()` - Estatísticas de usuários
- `modulos(User $user)` - Módulos do usuário

**Validações**:
- Email único
- CPF único e válido
- Role válida (user|admin|superadmin)

---

### AutarquiaController.php

**Responsabilidade**: CRUD de autarquias.

**Principais Métodos**:

- `index(Request $request)` - Lista autarquias com paginação
- `show(Autarquia $autarquia)` - Exibe autarquia específica
- `store(Request $request)` - Cria nova autarquia
- `update(Request $request, Autarquia $autarquia)` - Atualiza autarquia
- `destroy(Autarquia $autarquia)` - Deleta autarquia
- `stats()` - Estatísticas de autarquias
- `modulos(Autarquia $autarquia)` - Módulos da autarquia
- `usuarios(Autarquia $autarquia)` - Usuários da autarquia

**Validações**:
- CNPJ único e válido
- Nome obrigatório

---

### ModulosController.php

**Responsabilidade**: CRUD de módulos.

**Principais Métodos**:

- `index(Request $request)` - Lista módulos com paginação
- `show(Modulo $modulo)` - Exibe módulo específico
- `store(Request $request)` - Cria novo módulo
- `update(Request $request, Modulo $modulo)` - Atualiza módulo
- `destroy(Modulo $modulo)` - Deleta módulo
- `stats()` - Estatísticas de módulos
- `autarquias(Modulo $modulo)` - Autarquias que têm o módulo

**Validações**:
- Nome único
- Slug único

---

### AutarquiaModuloController.php

**Responsabilidade**: Gerenciar relação N:N entre autarquias e módulos (liberações).

**Principais Métodos**:

- `index(Request $request)` - Lista liberações
- `update(Request $request, $autarquiaId, $moduloId)` - Atualiza liberação
- `bulkUpdate(Request $request)` - Atualiza múltiplas liberações

**Campos da Pivot**:
- `ativo` - Se o módulo está ativo para a autarquia
- `data_ativacao` - Data de ativação

---

### UserAutarquiaController.php

**Responsabilidade**: Gerenciar relação N:N entre usuários e autarquias.

**Principais Métodos**:

- `index(User $user)` - Lista autarquias do usuário
- `attach(Request $request, User $user)` - Vincula autarquias ao usuário
- `detach(Request $request, User $user)` - Desvincula autarquias
- `sync(Request $request, User $user)` - Sincroniza autarquias (add + remove)
- `updateActive(Request $request, User $user)` - Atualiza autarquia ativa

**Campos da Pivot**:
- `role` - Role do usuário naquela autarquia
- `is_admin` - Se é admin da autarquia
- `is_default` - Se é a autarquia preferida
- `ativo` - Se o vínculo está ativo

---

### UsuarioModuloPermissaoController.php

**Responsabilidade**: Gerenciar permissões granulares (usuário + módulo + autarquia).

**Principais Métodos**:

- `index(Request $request)` - Lista permissões
- `show($userId, $moduloId, $autarquiaId)` - Exibe permissão específica
- `store(Request $request)` - Cria permissão
- `update(Request $request, $userId, $moduloId, $autarquiaId)` - Atualiza permissão
- `destroy($userId, $moduloId, $autarquiaId)` - Deleta permissão
- `bulkStore(Request $request)` - Cria múltiplas permissões
- `checkPermission($userId, $moduloId)` - Verifica permissão

**Permissões**:
- `view` - Visualizar
- `create` - Criar
- `edit` - Editar
- `delete` - Deletar

---

### SessionController.php

**Responsabilidade**: Gerenciar sessão Laravel (autarquia ativa).

**Principais Métodos**:

- `getActiveAutarquia(Request $request)` - Obtém autarquia ativa da sessão
- `setActiveAutarquia(Request $request)` - Define autarquia ativa
- `clearActiveAutarquia(Request $request)` - Limpa autarquia ativa

**Armazenamento**:
- Usa `session()` do Laravel para persistir `autarquia_ativa_id` no server-side

---

### RoleController.php

**Responsabilidade**: Listar roles disponíveis.

**Principais Métodos**:

- `index()` - Retorna lista de roles: `['user', 'admin', 'superadmin']`

---

## Models

### User.php

**Relacionamentos**:

```php
// N:N com Autarquias
public function autarquias(): BelongsToMany

// 1:N - Autarquia preferida
public function autarquiaPreferida(): BelongsTo

// N:N com Módulos através de permissões
public function permissoes(): HasMany
```

**Scopes**:

```php
// Apenas usuários ativos
User::active()->get()

// Apenas superadmins
User::superadmin()->get()

// Por role
User::role('admin')->get()
```

**Atributos Especiais**:

- `$hidden = ['password', 'refresh_token']` - Ocultos em respostas JSON
- `$casts = ['is_superadmin' => 'boolean', 'is_active' => 'boolean']`

---

### Autarquia.php

**Relacionamentos**:

```php
// N:N com Usuários
public function usuarios(): BelongsToMany

// N:N com Módulos
public function modulos(): BelongsToMany

// 1:N - Usuários que têm esta como preferida
public function usuariosComPreferida(): HasMany
```

**Scopes**:

```php
// Apenas autarquias ativas
Autarquia::ativo()->get()

// Por estado
Autarquia::porEstado('SP')->get()
```

---

### Modulo.php

**Relacionamentos**:

```php
// N:N com Autarquias
public function autarquias(): BelongsToMany

// N:N com Usuários através de permissões
public function permissoes(): HasMany
```

**Scopes**:

```php
// Apenas módulos ativos
Modulo::ativo()->get()
```

---

### AutarquiaModulo.php

**Tabela Pivot**: `autarquia_modulo`

Modelo explícito para gerenciar a relação N:N entre Autarquias e Módulos.

**Campos**:
- `autarquia_id`
- `modulo_id`
- `ativo`
- `data_ativacao`

---

### UsuarioModuloPermissao.php

**Tabela**: `usuario_modulo_permissao`

Modelo para permissões granulares.

**Relacionamentos**:

```php
public function usuario(): BelongsTo
public function modulo(): BelongsTo
public function autarquia(): BelongsTo
```

**Campos de Permissão**:
- `view`
- `create`
- `edit`
- `delete`

---

## Migrations

### Ordem Cronológica

As migrations estão organizadas cronologicamente com prefixos de data:

#### 1. Migrações Base (Laravel)

| Arquivo | Descrição |
|---------|-----------|
| `0001_01_01_000000_create_users_table` | Tabela users inicial |
| `0001_01_01_000001_create_cache_table` | Tabela de cache |
| `0001_01_01_000002_create_jobs_table` | Tabela de jobs |

#### 2. Adições na Tabela Users

| Arquivo | Descrição |
|---------|-----------|
| `2025_10_13_125605_add_is_superadmin_to_users_table` | Adiciona campo `is_superadmin` |
| `2025_10_13_130407_create_personal_access_tokens_table` | Tabela para Sanctum tokens |
| `2025_10_16_124508_add_role_and_cpf_to_users_table` | Adiciona `role` e `cpf` |
| `2025_10_16_145233_add_is_active_table` | Adiciona `is_active` |
| `2025_10_27_000000_add_refresh_token_to_users_table` | Adiciona refresh token |

#### 3. Criação de Entidades Principais

| Arquivo | Descrição |
|---------|-----------|
| `2025_10_16_150000_create_autarquias_table` | Tabela de autarquias |
| `2025_10_16_150001_create_modulos_table` | Tabela de módulos |
| `2025_10_16_150002_add_autarquia_id_to_users_table` | FK `autarquia_preferida_id` em users |

#### 4. Tabelas Pivot e Relacionamentos

| Arquivo | Descrição |
|---------|-----------|
| `2025_10_16_150003_create_autarquia_modulo_table` | Pivot Autarquia ↔ Módulo |
| `2025_10_16_150004_create_usuario_modulo_permissao_table` | Tabela de permissões |
| `2025_10_17_000001_create_usuario_autarquia_table` | Pivot User ↔ Autarquia |

#### 5. Melhorias e Ajustes

| Arquivo | Descrição |
|---------|-----------|
| `2025_10_22_100000_add_id_primary_key_to_autarquia_modulo_table` | Adiciona PK à pivot |
| `2025_10_25_151547_rename_autarquia_ativa_migration` | Renomeia campo de autarquia ativa |
| `2025_10_26_000000_add_performance_indexes` | Adiciona índices de performance |

#### 6. Debugging e Monitoramento

| Arquivo | Descrição |
|---------|-----------|
| `2025_10_22_151219_create_telescope_entries_table` | Tabelas do Laravel Telescope |

### Principais Campos por Tabela

#### users

```php
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email')->unique();
    $table->string('cpf')->unique()->nullable();
    $table->string('password');
    $table->enum('role', ['user', 'admin', 'superadmin'])->default('user');
    $table->boolean('is_superadmin')->default(false);
    $table->boolean('is_active')->default(true);
    $table->foreignId('autarquia_preferida_id')->nullable()->constrained('autarquias');
    $table->string('refresh_token')->nullable();
    $table->timestamp('refresh_token_expires_at')->nullable();
    $table->rememberToken();
    $table->timestamps();
});
```

#### autarquias

```php
Schema::create('autarquias', function (Blueprint $table) {
    $table->id();
    $table->string('nome');
    $table->string('cnpj')->unique();
    $table->string('cidade');
    $table->string('estado', 2);
    $table->boolean('ativo')->default(true);
    $table->timestamps();
});
```

#### modulos

```php
Schema::create('modulos', function (Blueprint $table) {
    $table->id();
    $table->string('nome')->unique();
    $table->string('slug')->unique();
    $table->text('descricao')->nullable();
    $table->boolean('ativo')->default(true);
    $table->timestamps();
});
```

#### usuario_autarquia

```php
Schema::create('usuario_autarquia', function (Blueprint $table) {
    $table->id();
    $table->foreignId('usuario_id')->constrained('users')->onDelete('cascade');
    $table->foreignId('autarquia_id')->constrained('autarquias')->onDelete('cascade');
    $table->enum('role', ['user', 'admin'])->default('user');
    $table->boolean('is_admin')->default(false);
    $table->boolean('is_default')->default(false); // Se é a autarquia preferida
    $table->boolean('ativo')->default(true);
    $table->timestamps();

    $table->unique(['usuario_id', 'autarquia_id']);
});
```

#### autarquia_modulo

```php
Schema::create('autarquia_modulo', function (Blueprint $table) {
    $table->id();
    $table->foreignId('autarquia_id')->constrained('autarquias')->onDelete('cascade');
    $table->foreignId('modulo_id')->constrained('modulos')->onDelete('cascade');
    $table->boolean('ativo')->default(false);
    $table->date('data_ativacao')->nullable();
    $table->timestamps();

    $table->unique(['autarquia_id', 'modulo_id']);
});
```

#### usuario_modulo_permissao

```php
Schema::create('usuario_modulo_permissao', function (Blueprint $table) {
    $table->id();
    $table->foreignId('usuario_id')->constrained('users')->onDelete('cascade');
    $table->foreignId('modulo_id')->constrained('modulos')->onDelete('cascade');
    $table->foreignId('autarquia_id')->constrained('autarquias')->onDelete('cascade');
    $table->boolean('view')->default(false);
    $table->boolean('create')->default(false);
    $table->boolean('edit')->default(false);
    $table->boolean('delete')->default(false);
    $table->timestamps();

    $table->unique(['usuario_id', 'modulo_id', 'autarquia_id']);
});
```

---

## Services e Traits

### AutarquiaSessionService.php

**Localização**: `app/Services/AutarquiaSessionService.php`

**Responsabilidade**: Gerenciar autarquia ativa na sessão Laravel.

**Principais Métodos**:

```php
// Define autarquia ativa
public function setActiveAutarquia(int $autarquiaId): void

// Obtém autarquia ativa
public function getActiveAutarquia(): ?int

// Limpa autarquia ativa
public function clearActiveAutarquia(): void

// Verifica se está em modo suporte
public function isSupportMode(): bool

// Ativa modo suporte
public function enableSupportMode(): void

// Desativa modo suporte
public function disableSupportMode(): void
```

**Uso**:

```php
// No controller
$service = app(AutarquiaSessionService::class);
$service->setActiveAutarquia($autarquiaId);
$autarquiaAtiva = $service->getActiveAutarquia();
```

---

### ApiResponses Trait

**Localização**: `app/Traits/ApiResponses.php`

**Responsabilidade**: Padronizar respostas da API.

**Métodos Disponíveis**:

```php
// Sucesso genérico
protected function success($data, string $message = null, int $status = 200)

// Erro genérico
protected function error(string $message, int $status = 400, $errors = null)

// Sucesso com dados paginados
protected function successPaginated($data, string $message = null)

// Não encontrado
protected function notFound(string $message = 'Recurso não encontrado')

// Não autorizado
protected function unauthorized(string $message = 'Não autorizado')

// Validação falhou
protected function validationError($errors, string $message = 'Erro de validação')
```

**Formato de Resposta**:

```json
{
  "success": true,
  "message": "Operação realizada com sucesso",
  "data": { }
}
```

**Uso no Controller**:

```php
use App\Traits\ApiResponses;

class UserController extends Controller
{
    use ApiResponses;

    public function show(User $user)
    {
        return $this->success($user, 'Usuário encontrado');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        // ...
    }
}
```

---

### CreatesTokens Trait

**Localização**: `app/Traits/CreatesTokens.php`

**Responsabilidade**: Gerar e gerenciar tokens JWT e refresh tokens.

**Principais Métodos**:

```php
// Gera access token (JWT)
protected function createAccessToken(User $user, array $claims = []): string

// Gera refresh token
protected function createRefreshToken(User $user): string

// Valida refresh token
protected function validateRefreshToken(User $user, string $refreshToken): bool

// Revoga refresh token
protected function revokeRefreshToken(User $user): void

// Decodifica JWT
protected function decodeToken(string $token): ?object
```

**Configuração de Tokens**:

- **Access Token**: JWT válido por 1 hora (configurável via `.env`)
- **Refresh Token**: String aleatória válida por 7 dias (configurável via `.env`)

**Uso no AuthController**:

```php
use App\Traits\CreatesTokens;

class AuthController extends Controller
{
    use CreatesTokens;

    public function login(Request $request)
    {
        // ... validação de credenciais

        $accessToken = $this->createAccessToken($user);
        $refreshToken = $this->createRefreshToken($user);

        return response()->json([
            'token' => $accessToken,
            'refresh_token' => $refreshToken,
            'user' => $user
        ]);
    }

    public function refresh(Request $request)
    {
        $refreshToken = $request->refresh_token;
        $user = $request->user();

        if (!$this->validateRefreshToken($user, $refreshToken)) {
            return $this->unauthorized('Refresh token inválido');
        }

        $newAccessToken = $this->createAccessToken($user);
        $newRefreshToken = $this->createRefreshToken($user);

        return response()->json([
            'token' => $newAccessToken,
            'refresh_token' => $newRefreshToken
        ]);
    }
}
```

---

## Autenticação

### Fluxo de Login

1. Cliente envia `POST /api/login` com email e senha
2. Backend valida credenciais
3. Se válido, gera:
   - Access token (JWT, 1h)
   - Refresh token (string aleatória, 7d)
4. Salva refresh token no banco de dados (tabela `users`)
5. Define `autarquia_ativa_id` na sessão = `autarquia_preferida_id`
6. Retorna tokens e dados do usuário

### Fluxo de Refresh

1. Cliente envia `POST /api/refresh` com `refresh_token`
2. Backend valida refresh token:
   - Compara com o armazenado no BD
   - Verifica se não expirou
3. Se válido:
   - Gera novo access token
   - Gera novo refresh token (rotação de tokens)
   - Atualiza refresh token no BD
4. Retorna novos tokens

### Middleware de Autenticação

Todas as rotas autenticadas usam:

```php
Route::middleware(['auth:sanctum'])->group(function () {
    // rotas protegidas
});
```

O Sanctum valida o token JWT no header:

```
Authorization: Bearer {access_token}
```

---

## Modo Suporte

### Conceito

Modo suporte permite que **superadmins** assumam o contexto de qualquer autarquia para:
- Gerenciar usuários da autarquia
- Configurar módulos
- Ajustar permissões
- Visualizar dados como se fosse um admin da autarquia

### Assumir Contexto

**Endpoint**: `POST /api/support/assume-context`

**Body**:
```json
{
  "autarquia_id": 10
}
```

**Resposta**:
```json
{
  "success": true,
  "message": "Contexto assumido com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "context": {
    "autarquia": { },
    "support_mode": true,
    "is_admin": true,
    "modulos": [ ],
    "permissions": {
      "view": true,
      "create": true,
      "edit": true,
      "delete": true
    }
  }
}
```

**O que acontece**:
1. Backend valida se usuário é superadmin
2. Gera token temporário com informações da autarquia
3. Define na sessão:
   - `autarquia_ativa_id` = autarquia assumida
   - `support_mode` = true
4. Frontend salva contexto e substitui token

### Sair do Contexto

**Endpoint**: `POST /api/support/exit-context`

**Resposta**:
```json
{
  "success": true,
  "message": "Contexto restaurado",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { }
}
```

**O que acontece**:
1. Backend remove `support_mode` da sessão
2. Restaura `autarquia_ativa_id` original do superadmin
3. Gera novo token normal
4. Frontend restaura dados originais

---

## Permissões

### Estrutura de Permissões

As permissões são definidas em **3 níveis**:

1. **Módulo ativo na autarquia** (`autarquia_modulo.ativo`)
   - Se `false`, ninguém da autarquia vê o módulo

2. **Usuário vinculado à autarquia** (`usuario_autarquia.ativo`)
   - Se `false`, usuário não acessa nada da autarquia

3. **Permissões granulares** (`usuario_modulo_permissao`)
   - Controla ações específicas: view, create, edit, delete

### Verificação de Permissões

```php
// No backend
$permission = UsuarioModuloPermissao::where([
    'usuario_id' => $userId,
    'modulo_id' => $moduloId,
    'autarquia_id' => $autarquiaId
])->first();

if ($permission && $permission->create) {
    // Usuário pode criar
}
```

### Exemplo de Fluxo

1. Usuário acessa módulo "Gestão de Frota"
2. Backend verifica:
   - ✅ Módulo está ativo na autarquia?
   - ✅ Usuário está vinculado à autarquia?
   - ✅ Usuário tem permissão `view` no módulo?
3. Se sim, exibe módulo
4. Botões de ação são mostrados baseado em permissões:
   - `create` → Botão "Novo"
   - `edit` → Botão "Editar"
   - `delete` → Botão "Deletar"

---

## Padrões de Resposta

### Sucesso

```json
{
  "success": true,
  "message": "Operação realizada com sucesso",
  "data": { }
}
```

### Erro

```json
{
  "success": false,
  "message": "Erro ao processar requisição",
  "errors": {
    "field": ["Mensagem de erro"]
  }
}
```

### Paginação

```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [ ],
    "first_page_url": "http://...",
    "from": 1,
    "last_page": 10,
    "last_page_url": "http://...",
    "next_page_url": "http://...",
    "path": "http://...",
    "per_page": 15,
    "prev_page_url": null,
    "to": 15,
    "total": 150
  }
}
```

---

## Comandos Úteis

```bash
# Rodar migrations
php artisan migrate

# Rollback migrations
php artisan migrate:rollback

# Refresh migrations (drop all + migrate)
php artisan migrate:fresh

# Criar migration
php artisan make:migration create_example_table

# Criar model com migration
php artisan make:model Example -m

# Criar controller
php artisan make:controller Api/ExampleController --api

# Limpar cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Ver rotas
php artisan route:list

# Rodar testes
php artisan test

# Telescope (debugging)
php artisan telescope:install
php artisan migrate
```

---

## Documentação Adicional

- [Laravel Documentation](https://laravel.com/docs/11.x)
- [Laravel Sanctum](https://laravel.com/docs/11.x/sanctum)
- [Eloquent ORM](https://laravel.com/docs/11.x/eloquent)
- [Diagramas de Fluxo](../frontend/docs/FLOW_DIAGRAMS.md)

---

**Última atualização**: 2024-10-27
**Versão**: 1.0.0
