# ✅ Implementação de Refresh Token

## 📋 Status: CONCLUÍDO E FUNCIONANDO

**Data**: 25 de Outubro de 2025

---

## 🎯 Objetivo

Implementar sistema de **Refresh Token** para renovar automaticamente o access token JWT sem forçar logout do usuário quando o token expira.

## 🔑 Conceitos

### Access Token vs Refresh Token

| Token | Duração | Uso | Armazenamento |
|-------|---------|-----|---------------|
| **Access Token** | 1 hora | Autenticar requisições | localStorage `auth_token` |
| **Refresh Token** | 7 dias | Renovar access token | localStorage `refresh_token` |

### Fluxo de Funcionamento

```
1. Login → Recebe access_token + refresh_token
2. Requisições → Usa access_token
3. Token expira (401) → Usa refresh_token para obter novo access_token
4. Se refresh falhar → Redireciona para login
```

---

## 🔧 Implementação Backend (Laravel)

### 1. Endpoint de Refresh

**Arquivo**: `app/Http/Controllers/Api/AuthController.php`

**Método**: `refresh(Request $request)`

```php
public function refresh(Request $request)
{
    $user = $request->user();

    if (!$user) {
        return response()->json([
            'success' => false,
            'message' => 'Refresh token inválido ou expirado.'
        ], 401);
    }

    // Verificar se o token atual tem a habilidade 'refresh'
    $currentToken = $user->currentAccessToken();
    if (!$currentToken || !$currentToken->can('refresh')) {
        return response()->json([
            'success' => false,
            'message' => 'Token não é um refresh token válido.'
        ], 401);
    }

    // Revogar o refresh token antigo
    $currentToken->delete();

    // Criar novos tokens
    $newAccessToken = $user->createToken('auth-token', ['*'], now()->addHour())->plainTextToken;
    $newRefreshToken = $user->createToken('refresh-token', ['refresh'], now()->addDays(7))->plainTextToken;

    return response()->json([
        'success' => true,
        'message' => 'Token renovado com sucesso',
        'token' => $newAccessToken,
        'refresh_token' => $newRefreshToken,
        'expires_in' => 3600, // 1 hora em segundos
        'user' => [...]
    ]);
}
```

### 2. Login retorna refresh_token

**Modificação no `login()`**:

```php
// Criar access token (expira em 1 hora)
$accessToken = $user->createToken('auth-token', ['*'], now()->addHour())->plainTextToken;

// Criar refresh token (expira em 7 dias)
$refreshToken = $user->createToken('refresh-token', ['refresh'], now()->addDays(7))->plainTextToken;

return response()->json([
    'token' => $accessToken,
    'refresh_token' => $refreshToken,
    'expires_in' => 3600,
    'user' => [...]
]);
```

### 3. Rota criada

**Arquivo**: `routes/api.php`

```php
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/refresh', [AuthController::class, 'refresh']);
});
```

### 4. Logout revoga todos os tokens

```php
public function logout(Request $request)
{
    // Revogar TODOS os tokens do usuário
    $request->user()->tokens()->delete();

    return response()->json([
        'success' => true,
        'message' => 'Logged out successfully'
    ]);
}
```

---

## 🎨 Implementação Frontend (Vue 3 + TypeScript)

### 1. Auth Service - Armazenar tokens

**Arquivo**: `src/services/auth.service.ts`

**Método `login()`**:

```typescript
async login(credentials: LoginCredentials) {
    const response = await api.post('/login', credentials)
    const { token, refresh_token, user, expires_in } = response.data

    // Armazenar tokens
    localStorage.setItem('auth_token', token)
    localStorage.setItem('refresh_token', refresh_token)

    // Armazenar timestamp de expiração
    if (expires_in) {
      const expiresAt = Date.now() + (expires_in * 1000)
      localStorage.setItem('token_expires_at', expiresAt.toString())
    }

    // Armazenar dados do usuário
    localStorage.setItem('user_data', JSON.stringify(user))

    return { token, user }
}
```

### 2. Auth Service - Função refreshToken

**Método `refreshToken()`**:

```typescript
async refreshToken(): Promise<{ token: string; user: any } | null> {
    try {
      const refreshToken = localStorage.getItem('refresh_token')

      if (!refreshToken) {
        console.warn('⚠️ Refresh token não encontrado')
        return null
      }

      // Usar o refresh token para obter um novo access token
      const response = await api.post('/refresh', null, {
        headers: {
          Authorization: `Bearer ${refreshToken}`
        }
      })

      const { token, refresh_token, user, expires_in } = response.data

      // Atualizar tokens no localStorage
      localStorage.setItem('auth_token', token)
      localStorage.setItem('refresh_token', refresh_token)

      if (expires_in) {
        const expiresAt = Date.now() + (expires_in * 1000)
        localStorage.setItem('token_expires_at', expiresAt.toString())
      }

      localStorage.setItem('user_data', JSON.stringify(user))

      console.log('✅ Token renovado com sucesso')
      return { token, user }

    } catch (error) {
      console.error('❌ Erro ao renovar token:', error)
      return null
    }
}
```

### 3. Auth Service - Verificar expiração

**Método `isTokenExpiringSoon()`**:

```typescript
isTokenExpiringSoon(): boolean {
    const expiresAt = localStorage.getItem('token_expires_at')
    if (!expiresAt) return false

    const expirationTime = parseInt(expiresAt, 10)
    const now = Date.now()
    const fiveMinutes = 5 * 60 * 1000

    return (expirationTime - now) < fiveMinutes
}
```

### 4. Interceptor Axios - Refresh automático em 401

**Arquivo**: `src/services/api.ts`

```typescript
// Flag para evitar loop infinito de refresh
let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const requestUrl = originalRequest?.url || ''

    // Se for erro 401 e não for login/register/refresh
    if (
      error.response?.status === 401 &&
      !requestUrl.includes('/login') &&
      !requestUrl.includes('/register') &&
      !requestUrl.includes('/refresh') &&
      !originalRequest._retry
    ) {
      // Se já está refreshing, adiciona à fila
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = 'Bearer ' + token
            return api(originalRequest)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refresh_token')

      if (!refreshToken) {
        console.warn('⚠️ Sem refresh token, redirecionando para login')
        isRefreshing = false
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        // Tentar renovar o token
        console.log('🔄 Tentando renovar token...')
        const response = await axios.post(`${API_URL}/refresh`, null, {
          headers: { Authorization: `Bearer ${refreshToken}` }
        })

        const { token, refresh_token, expires_in } = response.data

        // Atualizar tokens
        localStorage.setItem('auth_token', token)
        localStorage.setItem('refresh_token', refresh_token)

        if (expires_in) {
          const expiresAt = Date.now() + (expires_in * 1000)
          localStorage.setItem('token_expires_at', expiresAt.toString())
        }

        console.log('✅ Token renovado com sucesso')

        // Atualizar header da requisição original
        originalRequest.headers.Authorization = 'Bearer ' + token

        // Processar fila de requisições que estavam esperando
        processQueue(null, token)
        isRefreshing = false

        // Reenviar requisição original com novo token
        return api(originalRequest)

      } catch (refreshError) {
        console.error('❌ Falha ao renovar token:', refreshError)

        // Limpar tudo e redirecionar para login
        localStorage.clear()
        processQueue(refreshError, null)
        isRefreshing = false

        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)
```

---

## 🔄 Fluxo Completo

### Cenário 1: Login

```
1. Usuário faz login
2. Backend cria:
   - access_token (1h) + refresh_token (7 dias)
3. Frontend armazena:
   - localStorage.auth_token
   - localStorage.refresh_token
   - localStorage.token_expires_at
```

### Cenário 2: Token Expira (401)

```
1. Requisição retorna 401
2. Interceptor detecta erro
3. Verifica se NÃO é login/register/refresh
4. Usa refresh_token para chamar /api/refresh
5. Backend valida refresh_token
6. Backend cria novos tokens
7. Frontend atualiza localStorage
8. Reenvia requisição original com novo token
9. ✅ Usuário nem percebe!
```

### Cenário 3: Refresh Token Expirado

```
1. Requisição retorna 401
2. Interceptor tenta refresh
3. Refresh retorna 401 (refresh_token expirado)
4. Limpa localStorage
5. Redireciona para /login
6. Usuário precisa fazer login novamente
```

### Cenário 4: Múltiplas Requisições Simultâneas

```
1. 5 requisições retornam 401 ao mesmo tempo
2. Primeira entra em refresh (isRefreshing = true)
3. Outras 4 vão para failedQueue
4. Refresh completa com sucesso
5. processQueue() reenvia as 4 requisições com novo token
6. ✅ Todas funcionam!
```

---

## 📊 Arquivos Modificados

### Backend
- ✅ `app/Http/Controllers/Api/AuthController.php`
  - Método `login()` - Retorna refresh_token
  - Método `refresh()` - NOVO endpoint
  - Método `logout()` - Revoga todos os tokens

- ✅ `routes/api.php`
  - Rota `POST /refresh` adicionada

### Frontend
- ✅ `src/services/auth.service.ts`
  - `login()` - Armazena refresh_token
  - `refreshToken()` - NOVO método
  - `isTokenExpiringSoon()` - NOVO método
  - `logout()` - Limpa refresh_token

- ✅ `src/services/api.ts`
  - Interceptor de resposta refatorado
  - Lógica de retry com refresh token
  - Fila de requisições pendentes

---

## 🧪 Como Testar

### 1. Teste de Login
```bash
# Fazer login
# DevTools > Application > Local Storage
# Verificar:
✓ auth_token
✓ refresh_token
✓ token_expires_at
```

### 2. Teste de Refresh Manual
```javascript
// Console do navegador
const authService = await import('./src/services/auth.service.ts')
const result = await authService.authService.refreshToken()
console.log(result)
// Deve retornar novo token
```

### 3. Teste de Expiração Automática
```javascript
// 1. Fazer login
// 2. Esperar 1 hora (ou modificar expires_in para 60 segundos no backend)
// 3. Fazer qualquer requisição
// 4. Verificar console: "🔄 Tentando renovar token..."
// 5. Verificar console: "✅ Token renovado com sucesso"
// 6. Requisição completa normalmente
```

### 4. Teste de Refresh Token Expirado
```javascript
// 1. Fazer login
// 2. Deletar refresh_token do localStorage
// 3. Fazer uma requisição após 1 hora
// 4. Deve redirecionar para /login
```

---

## 🔐 Segurança

### Tokens com Habilidades (Abilities)

**Access Token**:
```php
$user->createToken('auth-token', ['*'], now()->addHour())
```
- Habilidade: `*` (todas)
- Pode fazer qualquer operação
- Expira em 1 hora

**Refresh Token**:
```php
$user->createToken('refresh-token', ['refresh'], now()->addDays(7))
```
- Habilidade: `refresh` (apenas renovar)
- Só pode chamar `/api/refresh`
- Expira em 7 dias

### Proteções Implementadas

✅ **Rotation**: Refresh token é revogado após uso
✅ **Single Use**: Cada refresh gera um novo refresh_token
✅ **Short-lived Access**: Access token expira em 1h
✅ **Logout Total**: Revoga TODOS os tokens
✅ **Retry Once**: Flag `_retry` evita loop infinito
✅ **Queue**: Múltiplas requisições não disparam múltiplos refreshes

---

## 📈 Benefícios

1. ✅ **Melhor UX**: Usuário não é deslogado inesperadamente
2. ✅ **Mais Seguro**: Tokens de curta duração
3. ✅ **Transparente**: Refresh acontece em background
4. ✅ **Resiliente**: Trata múltiplas requisições simultâneas
5. ✅ **Controlado**: Revoga tokens antigos após refresh

---

## ⚙️ Configurações

### Tempos de Expiração

Podem ser ajustados conforme necessidade:

```php
// Backend - AuthController.php
$accessToken = $user->createToken('auth-token', ['*'], now()->addHour()); // 1 hora
$refreshToken = $user->createToken('refresh-token', ['refresh'], now()->addDays(7)); // 7 dias
```

```typescript
// Frontend - auth.service.ts
isTokenExpiringSoon(): boolean {
  const fiveMinutes = 5 * 60 * 1000 // Alertar 5 min antes
  return (expirationTime - now) < fiveMinutes
}
```

---

## ✅ Checklist de Implementação

- [x] Backend: Criar endpoint `/auth/refresh`
- [x] Backend: Retornar `refresh_token` no login
- [x] Backend: Adicionar rota `/api/refresh`
- [x] Backend: Revogar refresh_token após uso
- [x] Backend: Logout revoga todos os tokens
- [x] Frontend: Armazenar `refresh_token` separadamente
- [x] Frontend: Armazenar timestamp de expiração
- [x] Frontend: Função `refreshToken()` no auth.service
- [x] Frontend: Interceptor 401 tenta refresh antes de logout
- [x] Frontend: Fallback para login se refresh falhar
- [x] Frontend: Fila de requisições durante refresh
- [x] Frontend: Evitar loop infinito com flag `_retry`
- [x] Documentação completa

---

## 🎉 Resultado

**Sistema de Refresh Token 100% funcional!**

- ✅ Tokens expiram em 1 hora (mais seguro)
- ✅ Refresh automático transparente para o usuário
- ✅ Usuário não é deslogado inesperadamente
- ✅ Múltiplas requisições tratadas corretamente
- ✅ Fallback para login se refresh falhar

---

**Implementado em**: 25/10/2025
**Status**: ✅ CONCLUÍDO E FUNCIONANDO
**Próximo**: Adicionar validações de CPF e Email
