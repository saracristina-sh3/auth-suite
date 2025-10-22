# API Endpoints - Sistema de Controle de Acesso Granular

Documentação completa dos endpoints da API REST do sistema de gestão de frota com controle de acesso baseado em autarquias e módulos.

## 📍 Base URL
```
http://localhost:8000/api
```

---

## 🔐 Autenticação

### Login
```http
POST /login
```
**Body:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "user": { ... },
    "token": "Bearer token..."
  }
}
```

### Logout
```http
POST /logout
```

### Dados do Usuário Autenticado
```http
GET /me
```

---

## 👥 Usuários

### Listar Usuários
```http
GET /users?per_page=10&autarquia_id=1&is_active=true
```
**Query Params:**
- `per_page` (opcional): Registros por página (padrão: 10)
- `autarquia_id` (opcional): Filtrar por autarquia
- `is_active` (opcional): Filtrar por status ativo

**Response:**
```json
{
  "success": true,
  "message": "Lista de usuários recuperada com sucesso.",
  "items": [...],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 10,
    "total": 45
  }
}
```

### Exibir Usuário
```http
GET /users/{user}
```
**Response:** Retorna usuário com autarquia e permissões ativas

### Criar Usuário
```http
POST /users
```
**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "password": "senha123",
  "cpf": "12345678901",
  "role": "user",
  "autarquia_id": 1,
  "is_active": true
}
```
**Validações:**
- `name`: obrigatório, string, max 255
- `email`: obrigatório, email válido, único
- `password`: obrigatório, mínimo 6 caracteres
- `cpf`: obrigatório, 11 dígitos, único
- `role`: obrigatório, valores: user, gestor, admin
- `autarquia_id`: obrigatório, deve existir na tabela autarquias
- `is_active`: opcional, booleano (padrão: true)

### Atualizar Usuário
```http
PUT /users/{user}
```
**Body:** Mesmos campos do POST, todos opcionais

### Excluir Usuário
```http
DELETE /users/{user}
```
**Obs:** Não permite exclusão se houver permissões vinculadas

### Módulos do Usuário
```http
GET /users/{user}/modulos
```
**Response:** Lista módulos que o usuário tem acesso

---

## 🏛️ Autarquias

### Listar Autarquias
```http
GET /autarquias?ativo=true&with_users_count=true&with_modulos=true
```
**Query Params:**
- `ativo` (opcional): Filtrar por status ativo
- `with_users_count` (opcional): Incluir contagem de usuários
- `with_modulos` (opcional): Incluir módulos ativos

### Exibir Autarquia
```http
GET /autarquias/{autarquia}
```
**Response:** Retorna autarquia com módulos e usuários

### Criar Autarquia
```http
POST /autarquias
```
**Body:**
```json
{
  "nome": "Prefeitura Municipal X",
  "ativo": true
}
```
**Validações:**
- `nome`: obrigatório, string, max 255, único
- `ativo`: opcional, booleano (padrão: true)

### Atualizar Autarquia
```http
PUT /autarquias/{autarquia}
```

### Excluir Autarquia
```http
DELETE /autarquias/{autarquia}
```
**Obs:** Não permite exclusão se houver usuários ou módulos vinculados

### Módulos da Autarquia
```http
GET /autarquias/{autarquia}/modulos
```
**Response:** Lista módulos ativos da autarquia

### Usuários da Autarquia
```http
GET /autarquias/{autarquia}/usuarios
```
**Response:** Lista usuários da autarquia

---

## 📦 Módulos

### Listar Módulos
```http
GET /modulos?ativo=true&autarquia_id=1&with_autarquias=true
```
**Query Params:**
- `ativo` (opcional): Filtrar por status ativo
- `autarquia_id` (opcional): Filtrar módulos de uma autarquia específica
- `with_autarquias_count` (opcional): Incluir contagem de autarquias
- `with_autarquias` (opcional): Incluir autarquias ativas

### Exibir Módulo
```http
GET /modulos/{modulo}
```

### Criar Módulo
```http
POST /modulos
```
**Body:**
```json
{
  "nome": "Gestão de Frota",
  "descricao": "Módulo para controle da frota de veículos",
  "icone": "truck",
  "ativo": true
}
```
**Validações:**
- `nome`: obrigatório, string, max 255, único
- `descricao`: opcional, texto
- `icone`: opcional, string, max 100
- `ativo`: opcional, booleano (padrão: true)

### Atualizar Módulo
```http
PUT /modulos/{modulo}
```

### Excluir Módulo
```http
DELETE /modulos/{modulo}
```
**Obs:** Não permite exclusão se houver autarquias vinculadas

### Autarquias do Módulo
```http
GET /modulos/{modulo}/autarquias
```
**Response:** Lista autarquias ativas que têm acesso ao módulo

---

## 🔗 Liberação de Módulos para Autarquias

### Listar Liberações
```http
GET /autarquia-modulo?autarquia_id=1&modulo_id=1&ativo=true
```
**Query Params:**
- `autarquia_id` (opcional): Filtrar por autarquia
- `modulo_id` (opcional): Filtrar por módulo
- `ativo` (opcional): Filtrar por status ativo

### Liberar Módulo para Autarquia
```http
POST /autarquia-modulo
```
**Body:**
```json
{
  "autarquia_id": 1,
  "modulo_id": 1,
  "data_liberacao": "2025-10-16T14:30:00",
  "ativo": true
}
```
**Validações:**
- `autarquia_id`: obrigatório, deve existir
- `modulo_id`: obrigatório, deve existir
- `data_liberacao`: opcional, data (padrão: now())
- `ativo`: opcional, booleano (padrão: true)

### Liberar Múltiplos Módulos
```http
POST /autarquia-modulo/bulk
```
**Body:**
```json
{
  "autarquia_id": 1,
  "modulo_ids": [1, 2, 3, 4]
}
```
**Response:** Retorna módulos liberados e erros (se houver)

### Atualizar Liberação
```http
PUT /autarquia-modulo/{autarquiaId}/{moduloId}
```
**Body:**
```json
{
  "ativo": false,
  "data_liberacao": "2025-10-16T14:30:00"
}
```

### Remover Liberação
```http
DELETE /autarquia-modulo/{autarquiaId}/{moduloId}
```
**Obs:** Não permite remoção se houver permissões de usuários vinculadas

---

## 🔑 Permissões de Usuários nos Módulos

### Listar Permissões
```http
GET /permissoes?user_id=1&modulo_id=1&autarquia_id=1&ativo=true
```
**Query Params:**
- `user_id` (opcional): Filtrar por usuário
- `modulo_id` (opcional): Filtrar por módulo
- `autarquia_id` (opcional): Filtrar por autarquia
- `ativo` (opcional): Filtrar por status ativo

### Exibir Permissão
```http
GET /permissoes/{userId}/{moduloId}/{autarquiaId}
```

### Criar Permissão
```http
POST /permissoes
```
**Body:**
```json
{
  "user_id": 1,
  "modulo_id": 1,
  "autarquia_id": 1,
  "permissao_leitura": true,
  "permissao_escrita": true,
  "permissao_exclusao": false,
  "permissao_admin": false,
  "ativo": true
}
```
**Validações:**
- `user_id`: obrigatório, deve existir
- `modulo_id`: obrigatório, deve existir
- `autarquia_id`: obrigatório, deve existir
- Usuário deve pertencer à autarquia informada
- Módulo deve estar liberado para a autarquia
- `permissao_leitura`: opcional, booleano (padrão: false)
- `permissao_escrita`: opcional, booleano (padrão: false)
- `permissao_exclusao`: opcional, booleano (padrão: false)
- `permissao_admin`: opcional, booleano (padrão: false)
- `ativo`: opcional, booleano (padrão: true)

### Criar Permissões em Lote
```http
POST /permissoes/bulk
```
**Body:**
```json
{
  "user_id": 1,
  "autarquia_id": 1,
  "modulos": [
    {
      "modulo_id": 1,
      "permissao_leitura": true,
      "permissao_escrita": true,
      "permissao_exclusao": true,
      "permissao_admin": true
    },
    {
      "modulo_id": 2,
      "permissao_leitura": true,
      "permissao_escrita": false,
      "permissao_exclusao": false,
      "permissao_admin": false
    }
  ]
}
```
**Response:** Retorna permissões criadas e erros (se houver)

### Atualizar Permissão
```http
PUT /permissoes/{userId}/{moduloId}/{autarquiaId}
```
**Body:**
```json
{
  "permissao_leitura": true,
  "permissao_escrita": true,
  "permissao_exclusao": true,
  "permissao_admin": false,
  "ativo": true
}
```

### Remover Permissão
```http
DELETE /permissoes/{userId}/{moduloId}/{autarquiaId}
```

### Verificar Permissão do Usuário
```http
GET /permissoes/check/{userId}/{moduloId}
```
**Response:**
```json
{
  "success": true,
  "message": "Permissões do usuário recuperadas com sucesso.",
  "data": {
    "tem_acesso": true,
    "pode_ler": true,
    "pode_escrever": true,
    "pode_excluir": false,
    "e_admin": false,
    "permissao": { ... }
  }
}
```

---

## 🎭 Roles (Compatibilidade)

### Listar Roles
```http
GET /roles
```
**Response:** Lista de roles disponíveis no sistema

---

## 📊 Estrutura de Resposta Padrão

### Sucesso
```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": { ... }
}
```

### Erro de Validação (422)
```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "campo": ["Mensagem de erro"]
  }
}
```

### Erro Não Encontrado (404)
```json
{
  "success": false,
  "message": "Recurso não encontrado."
}
```

### Erro de Servidor (500)
```json
{
  "success": false,
  "message": "Erro interno do servidor."
}
```

---

## 🔒 Níveis de Permissão

### Tipos de Permissão
- **Leitura (`permissao_leitura`)**: Visualizar dados do módulo
- **Escrita (`permissao_escrita`)**: Criar e editar dados
- **Exclusão (`permissao_exclusao`)**: Remover dados
- **Admin (`permissao_admin`)**: Administrador do módulo (pode gerenciar outros usuários)

### Roles de Usuário
- **user**: Usuário comum
- **gestor**: Gestor de módulo
- **admin**: Administrador da autarquia
- **superadmin**: Super administrador (equipe de suporte - acesso total a todos os módulos e autarquias)

---

## 🧪 Exemplos de Uso

### Cenário 1: Criar uma Nova Autarquia com Módulos

```bash
# 1. Criar autarquia
curl -X POST http://localhost:8000/api/autarquias \
  -H "Content-Type: application/json" \
  -d '{"nome": "Prefeitura ABC", "ativo": true}'

# 2. Liberar módulos para a autarquia
curl -X POST http://localhost:8000/api/autarquia-modulo/bulk \
  -H "Content-Type: application/json" \
  -d '{"autarquia_id": 1, "modulo_ids": [1, 2, 3]}'

# 3. Criar usuário da autarquia
curl -X POST http://localhost:8000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@prefeiturabc.gov.br",
    "password": "senha123",
    "cpf": "12345678901",
    "role": "gestor",
    "autarquia_id": 1
  }'

# 4. Conceder permissões ao usuário
curl -X POST http://localhost:8000/api/permissoes/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "autarquia_id": 1,
    "modulos": [
      {
        "modulo_id": 1,
        "permissao_leitura": true,
        "permissao_escrita": true,
        "permissao_exclusao": true,
        "permissao_admin": true
      }
    ]
  }'
```

### Cenário 2: Verificar Acesso de Usuário a um Módulo

```bash
curl -X GET http://localhost:8000/api/permissoes/check/1/1
```

### Cenário 3: Listar Módulos Disponíveis para uma Autarquia

```bash
curl -X GET "http://localhost:8000/api/modulos?autarquia_id=1&ativo=true"
```

---

## 📝 Notas Importantes

1. **Integridade Referencial**: O sistema impede exclusões que quebrariam a integridade dos dados (ex: não é possível excluir uma autarquia com usuários vinculados).

2. **Validação de Permissões**: Ao criar permissões, o sistema valida:
   - Se o usuário pertence à autarquia informada
   - Se o módulo está liberado para a autarquia

3. **Superadmin e Autarquia SH3**:
   - Usuários com `role=superadmin` e `is_superadmin=true` têm acesso total a todos os módulos de todas as autarquias
   - Estes usuários são vinculados à autarquia especial "SH3 - Suporte"
   - A autarquia SH3 é criada automaticamente ao executar os seeders
   - Ideal para a equipe de suporte que realiza implantação e intervenções nos sistemas dos clientes

4. **Autenticação**: As rotas estão temporariamente sem middleware de autenticação para facilitar o desenvolvimento. Descomente a linha do middleware em [routes/api.php:26](backend/routes/api.php#L26) para ativar a autenticação.

5. **Paginação**: Endpoints de listagem suportam paginação através do parâmetro `per_page`.

6. **Relacionamentos Eager Loading**: Use query params como `with_*` para incluir relacionamentos e otimizar consultas.

---

📌 **Última atualização:** 16/10/2025
