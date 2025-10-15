# Documentação - Sistema de Login

## Visão Geral

O sistema de autenticação utiliza **Laravel Sanctum** no backend e **Vue 3 + Axios** no frontend, rodando em containers Docker.

## Arquitetura

### Backend (Laravel + Sanctum)
- **Container**: `gestao_frota_app_local`
- **Porta**: 8000
- **Endpoints**:
  - `POST /api/login` - Autenticação
  - `GET /api/user` - Dados do usuário autenticado
  - `POST /api/logout` - Encerrar sessão

### Frontend (Vue 3 + Vite)
- **Desenvolvimento Local**: porta 5173
- **Produção**: Servido pelo backend via Apache

## Configuração do Ambiente

### 1. Variáveis de Ambiente

#### Backend (/.env)
```env
APP_URL=http://localhost
APP_PORT=8000

DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_DATABASE=frota
DB_USERNAME=root
DB_PASSWORD=root

SUPERADMIN_NAME="Super Admin"
SUPERADMIN_EMAIL=admin@empresa.com
SUPERADMIN_PASSWORD=admin123
```

#### Frontend (/frontend/.env)
```env
VITE_API_URL=http://localhost:8000/api
```

### 2. Configuração CORS

O CORS está configurado em [backend/config/cors.php](../backend/config/cors.php):

```php
'paths' => ['api/*', 'sanctum/csrf-cookie', 'graphql'],
'allowed_methods' => ['*'],
'allowed_origins' => ['*'],
'allowed_headers' => ['*'],
'supports_credentials' => false,
```

### 3. Configuração Sanctum

Domínios stateful configurados em [backend/config/sanctum.php](../backend/config/sanctum.php#L18-L23):

```php
'stateful' => [
    'localhost',
    'localhost:3000',
    'localhost:5173',
    '127.0.0.1',
    '127.0.0.1:8000',
    '127.0.0.1:5173',
    '::1'
],
```

## Como Usar

### 1. Iniciar o Ambiente Docker

```bash
# Na raiz do projeto
docker compose up -d

# Verificar se os containers estão rodando
docker compose ps
```

Os seguintes containers serão iniciados:
- **gestao_frota_db_local** - PostgreSQL (porta 5432)
- **gestao_frota_init_local** - Inicialização (migrations e seeds)
- **gestao_frota_frontend_local** - Build do frontend
- **gestao_frota_app_local** - Aplicação principal (porta 8000)

### 2. Acessar a Aplicação

**Produção (via Docker):**
- URL: http://localhost:8000
- O frontend já está buildado e servido pelo backend

**Desenvolvimento Frontend (com hot-reload):**
```bash
cd frontend
npm install
npm run dev
```
- URL: http://localhost:5173/login

### 3. Credenciais Padrão

Conforme configurado no `.env`:
- **Email**: admin@empresa.com
- **Senha**: admin123

### 4. Criar Usuário Manualmente (Opcional)

Se necessário criar outro usuário:

```bash
# Acessar o container
docker compose exec app bash

# Executar o tinker
php artisan tinker
```

No tinker:
```php
$user = new App\Models\User();
$user->name = 'Admin Teste';
$user->email = 'admin@teste.com';
$user->password = bcrypt('senha123');
$user->save();
exit
```

## Fluxo de Autenticação

1. **Usuário** preenche email/senha no formulário
2. **Frontend** envia `POST /api/login` com credenciais
3. **Backend** valida no banco de dados
4. **Backend** retorna `{token, user}` se válido
5. **Frontend** armazena token no `localStorage`
6. **Frontend** configura header `Authorization: Bearer {token}`
7. **Frontend** redireciona para página principal
8. Requisições subsequentes incluem o token automaticamente

## Implementação

### Frontend

#### Serviço de Autenticação
Arquivo: [frontend/src/services/auth.service.ts](../frontend/src/services/auth.service.ts)

**Principais funcionalidades:**
- Configura `baseURL` a partir da variável de ambiente `VITE_API_URL`
- Interceptor que adiciona token em todas requisições
- Interceptor que trata erro 401 (redireciona para login)
- Tratamento de erros com mensagens específicas do Laravel

```typescript
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Interceptor: adiciona token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: trata erro 401
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

#### Componente de Login
Arquivo: [frontend/src/views/LoginView.vue](../frontend/src/views/LoginView.vue#L91-L99)

```typescript
async function onLogin() {
  error.value = '';
  try {
    await login(email.value, password.value);
    router.push('/');
  } catch (e: any) {
    error.value = e.message || 'Falha ao autenticar. Tente novamente.';
  }
}
```

### Backend

#### Rota de Login
Arquivo: [backend/routes/api.php](../backend/routes/api.php#L9-L29)

```php
Route::post('/login', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    $user = User::where('email', $request->email)->first();

    if (! $user || ! Hash::check($request->password, $user->password)) {
        throw ValidationException::withMessages([
            'email' => ['Credenciais inválidas.'],
        ]);
    }

    $token = $user->createToken('api')->plainTextToken;

    return response()->json([
        'token' => $token,
        'user' => $user,
    ]);
});
```

## Configuração Vite (Desenvolvimento)

Arquivo: [frontend/vite.config.ts](../frontend/vite.config.ts#L18-L29)

```typescript
server: {
  host: '0.0.0.0',
  port: 5173,
  proxy: {
    '/api': {
      target: process.env.VITE_API_URL || 'http://localhost:8000',
      changeOrigin: true,
      secure: false,
      rewrite: (path) => path
    }
  }
}
```

O proxy redireciona requisições `/api/*` do frontend (5173) para o backend (8000).

## Solução de Problemas

### Erro: "Network Error" ou "Failed to fetch"

**Causa**: Frontend não consegue conectar ao backend.

**Solução**:
1. Verificar se o container está rodando:
   ```bash
   docker compose ps
   ```

2. Verificar logs do container:
   ```bash
   docker compose logs -f app
   ```

3. Verificar variável `VITE_API_URL` em `/frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```

4. Testar a API diretamente:
   ```bash
   curl http://localhost:8000/api/user
   ```

### Erro: "Credenciais inválidas"

**Causa**: Email ou senha incorretos.

**Solução**:
1. Verificar credenciais no `.env` (raiz do projeto):
   ```env
   SUPERADMIN_EMAIL=admin@empresa.com
   SUPERADMIN_PASSWORD=admin123
   ```

2. Resetar senha do super admin:
   ```bash
   docker compose exec app php artisan tinker
   ```

   No tinker:
   ```php
   $user = User::where('email', 'admin@empresa.com')->first();
   $user->password = bcrypt('admin123');
   $user->save();
   exit
   ```

### Erro 401 em requisições autenticadas

**Causa**: Token inválido ou expirado.

**Solução**:
1. Limpar localStorage no console do navegador:
   ```javascript
   localStorage.clear()
   ```

2. Fazer login novamente

3. Verificar no Network DevTools se o header `Authorization` está sendo enviado

### CORS Error

**Causa**: Configuração CORS restritiva.

**Solução**:
1. Verificar [backend/config/cors.php](../backend/config/cors.php)
2. Em desenvolvimento, `allowed_origins` deve ser `['*']`
3. Reiniciar container:
   ```bash
   docker compose restart app
   ```

### Frontend não reconhece variável VITE_API_URL

**Causa**: Vite não recarregou variáveis de ambiente.

**Solução**:
1. Parar o servidor de desenvolvimento (Ctrl+C)
2. Verificar se `/frontend/.env` existe e contém:
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```
3. Reiniciar servidor:
   ```bash
   npm run dev
   ```

## Comandos Úteis Docker

```bash
# Ver logs do container
docker compose logs -f app

# Acessar o container
docker compose exec app bash

# Limpar cache do Laravel
docker compose exec app php artisan cache:clear
docker compose exec app php artisan config:clear

# Rodar migrations
docker compose exec app php artisan migrate

# Rodar seeds
docker compose exec app php artisan db:seed

# Recriar containers (limpar tudo)
docker compose down -v
docker compose up -d

# Ver rotas da API
docker compose exec app php artisan route:list --path=api

# Verificar status dos containers
docker compose ps

# Ver logs de todos os containers
docker compose logs -f
```

## Segurança em Produção

### 1. CORS Restritivo
```php
// backend/config/cors.php
'allowed_origins' => [env('FRONTEND_URL', 'https://seudominio.com')],
'supports_credentials' => true,
```

### 2. HTTPS Obrigatório
Sempre usar conexões seguras em produção.

### 3. Expiração de Tokens
```php
// backend/config/sanctum.php
'expiration' => 60, // 60 minutos
```

### 4. Rate Limiting
Limitar tentativas de login para prevenir força bruta.

### 5. Variáveis de Ambiente
- Nunca commitar arquivos `.env`
- Usar valores seguros em produção
- Rotacionar `APP_KEY` regularmente

## Arquivos Importantes

| Arquivo | Descrição |
|---------|-----------|
| [backend/routes/api.php](../backend/routes/api.php) | Rotas da API |
| [backend/config/cors.php](../backend/config/cors.php) | Configuração CORS |
| [backend/config/sanctum.php](../backend/config/sanctum.php) | Configuração Sanctum |
| [frontend/src/services/auth.service.ts](../frontend/src/services/auth.service.ts) | Serviço de autenticação |
| [frontend/src/views/LoginView.vue](../frontend/src/views/LoginView.vue) | Componente de login |
| [frontend/vite.config.ts](../frontend/vite.config.ts) | Configuração Vite + Proxy |
| [frontend/.env](../frontend/.env) | Variáveis de ambiente frontend |
| [docker-compose.yaml](../docker-compose.yaml) | Configuração Docker |

## Referências

- [Laravel Sanctum](https://laravel.com/docs/sanctum)
- [Axios Interceptors](https://axios-http.com/docs/interceptors)
- [Vite Proxy](https://vitejs.dev/config/server-options.html#server-proxy)
- [Docker Compose](https://docs.docker.com/compose/)
- [Vue Router](https://router.vuejs.org/)
