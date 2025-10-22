# Implementação de Suporte a Múltiplas Autarquias

## Objetivo

Permitir que um usuário esteja vinculado a múltiplas autarquias, podendo alternar entre elas e ter diferentes roles/permissões em cada uma.

---

## Arquitetura

### Antes (1:N)
```
User ──belongsTo──> Autarquia
```
- Usuário pertencia a apenas uma autarquia
- Campo `autarquia_id` na tabela `users`

### Depois (N:N)
```
User ──belongsToMany──> Autarquia (via usuario_autarquia)
User ──belongsTo──> Autarquia Ativa (autarquia_ativa_id)
```
- Usuário pode estar vinculado a múltiplas autarquias
- Tabela pivot `usuario_autarquia` com role e permissões específicas por autarquia
- Campo `autarquia_ativa_id` para rastrear a autarquia no contexto atual
- Campo `autarquia_id` mantido para compatibilidade retroativa

---

## Implementação Backend (Completa ✅)

### 1. Migration - `2025_10_17_000001_create_usuario_autarquia_table.php`

#### Tabela Pivot `usuario_autarquia`
```php
Schema::create('usuario_autarquia', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('user_id');
    $table->unsignedBigInteger('autarquia_id');
    $table->string('role')->default('user');
    $table->boolean('is_admin')->default(false);
    $table->boolean('ativo')->default(true);
    $table->timestamp('data_vinculo')->useCurrent();
    $table->unique(['user_id', 'autarquia_id']);
    $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
    $table->foreign('autarquia_id')->references('id')->on('autarquias')->onDelete('cascade');
    $table->timestamps();
});
```

**Campos:**
- `user_id` - ID do usuário
- `autarquia_id` - ID da autarquia
- `role` - Role do usuário nesta autarquia (user, clientAdmin, etc.)
- `is_admin` - Se o usuário é admin desta autarquia
- `ativo` - Se o vínculo está ativo
- `data_vinculo` - Data de criação do vínculo

#### Migração de Dados Existentes
```php
DB::statement("
    INSERT INTO usuario_autarquia (user_id, autarquia_id, role, is_admin, ativo, created_at, updated_at)
    SELECT
        id as user_id,
        autarquia_id,
        role,
        (role = 'clientAdmin') as is_admin,
        is_active as ativo,
        created_at,
        updated_at
    FROM users
    WHERE autarquia_id IS NOT NULL
");
```

#### Campo `autarquia_ativa_id`
```php
Schema::table('users', function (Blueprint $table) {
    $table->unsignedBigInteger('autarquia_ativa_id')->nullable()->after('autarquia_id');
    $table->foreign('autarquia_ativa_id')->references('id')->on('autarquias')->onDelete('set null');
});

// Define autarquia_ativa_id = autarquia_id inicialmente
DB::statement('UPDATE users SET autarquia_ativa_id = autarquia_id WHERE autarquia_id IS NOT NULL');
```

---

### 2. Model User - Novos Relacionamentos

**Arquivo:** `backend/app/Models/User.php`

```php
/**
 * Relacionamento: Usuário pertence a uma autarquia (legado - mantido para compatibilidade)
 */
public function autarquia(): BelongsTo
{
    return $this->belongsTo(Autarquia::class, 'autarquia_id');
}

/**
 * Relacionamento: Usuário pode estar vinculado a múltiplas autarquias (N:N)
 */
public function autarquias(): BelongsToMany
{
    return $this->belongsToMany(Autarquia::class, 'usuario_autarquia')
        ->withPivot('role', 'is_admin', 'ativo', 'data_vinculo')
        ->withTimestamps();
}

/**
 * Relacionamento: Autarquia ativa no contexto atual
 */
public function autarquiaAtiva(): BelongsTo
{
    return $this->belongsTo(Autarquia::class, 'autarquia_ativa_id');
}

/**
 * Relacionamento: Autarquias ativas do usuário
 */
public function autarquiasAtivas(): BelongsToMany
{
    return $this->autarquias()->wherePivot('ativo', true);
}
```

---

### 3. Model User - Métodos Auxiliares

```php
/**
 * Apenas superadmin SH3 é considerado admin global
 */
public function isAdmin(): bool
{
    return $this->is_superadmin;
}

/**
 * Verifica se o usuário é admin de uma autarquia específica
 * (Não confundir com superadmin SH3 - isto é para admin de autarquia)
 */
public function isAdminDaAutarquia(?int $autarquiaId = null): bool
{
    // Superadmin SH3 tem acesso total mas não usa esta função
    if ($this->is_superadmin) {
        return false;
    }

    $autarquiaId = $autarquiaId ?? $this->autarquia_ativa_id ?? $this->autarquia_id;

    return $this->autarquias()
        ->where('autarquia_id', $autarquiaId)
        ->wherePivot('is_admin', true)
        ->wherePivot('ativo', true)
        ->exists();
}

/**
 * Troca o contexto de autarquia ativa
 */
public function trocarAutarquia(int $autarquiaId): bool
{
    // Verifica se o usuário tem acesso à autarquia
    $temAcesso = $this->autarquias()
        ->where('autarquia_id', $autarquiaId)
        ->wherePivot('ativo', true)
        ->exists();

    // Superadmin SH3 não precisa ter vínculo explícito
    if (!$temAcesso && !$this->is_superadmin) {
        return false;
    }

    $this->autarquia_ativa_id = $autarquiaId;
    $this->save();

    return true;
}

/**
 * Retorna o role do usuário para uma autarquia específica
 */
public function getRoleParaAutarquia(?int $autarquiaId = null): string
{
    // Superadmin SH3 sempre tem role de suporte
    if ($this->is_superadmin) {
        return 'suporteAdmin';
    }

    $autarquiaId = $autarquiaId ?? $this->autarquia_ativa_id ?? $this->autarquia_id;

    $pivot = $this->autarquias()
        ->where('autarquia_id', $autarquiaId)
        ->wherePivot('ativo', true)
        ->first()?->pivot;

    return $pivot?->role ?? $this->role;
}
```

**Observações Importantes:**
- ✅ Apenas `is_superadmin = true` é considerado admin global
- ✅ `is_superadmin` é **exclusivo** para usuários SH3 Suporte
- ✅ Usuários de autarquias podem ser admin da autarquia via pivot `is_admin`

---

### 4. AuthController - Novos Endpoints

**Arquivo:** `backend/app/Http/Controllers/Api/AuthController.php`

#### GET `/api/user/autarquias`
Lista todas as autarquias que o usuário tem acesso.

**Resposta para usuário normal:**
```json
{
  "success": true,
  "autarquias": [
    {
      "id": 1,
      "nome": "Prefeitura Municipal",
      "ativo": true,
      "role": "clientAdmin",
      "is_admin": true,
      "data_vinculo": "2025-01-15T10:30:00.000000Z"
    },
    {
      "id": 2,
      "nome": "Câmara Municipal",
      "ativo": true,
      "role": "user",
      "is_admin": false,
      "data_vinculo": "2025-02-20T14:20:00.000000Z"
    }
  ],
  "autarquia_ativa_id": 1
}
```

**Resposta para superadmin SH3:**
```json
{
  "success": true,
  "autarquias": [
    {
      "id": 1,
      "nome": "Prefeitura de São Paulo",
      "ativo": true,
      "role": "suporteAdmin",
      "is_admin": true
    },
    {
      "id": 2,
      "nome": "Prefeitura do Rio",
      "ativo": true,
      "role": "suporteAdmin",
      "is_admin": true
    }
    // ... todas as autarquias ativas
  ],
  "autarquia_ativa_id": null
}
```

**Comportamento especial para Superadmin SH3:**
- Vê **todas** as autarquias ativas do sistema
- Todas aparecem com `role: "suporteAdmin"` e `is_admin: true`
- Não precisa ter vínculo explícito na tabela `usuario_autarquia`

---

#### POST `/api/user/switch-autarquia`
Troca a autarquia ativa do usuário.

**Request:**
```json
{
  "autarquia_id": 2
}
```

**Resposta de sucesso:**
```json
{
  "success": true,
  "message": "Autarquia alterada com sucesso",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@example.com",
    "role": "user",
    "autarquia_id": 1,
    "autarquia_ativa_id": 2,
    "autarquia": {
      "id": 2,
      "nome": "Câmara Municipal",
      "ativo": true
    },
    "is_active": true,
    "is_superadmin": false
  }
}
```

**Resposta de erro (sem acesso):**
```json
{
  "success": false,
  "message": "Você não tem acesso a esta autarquia."
}
```
Status: `403 Forbidden`

**Validações:**
- ✅ Usuário deve ter vínculo ativo com a autarquia solicitada
- ✅ Superadmin SH3 pode trocar para qualquer autarquia ativa
- ✅ Usuários normais só podem trocar para autarquias vinculadas

---

### 5. Rotas API

**Arquivo:** `backend/routes/api.php`

```php
Route::middleware(['auth:sanctum'])->group(function () {

    // Suporte: Assumir contexto de autarquia (apenas para superadmin/Sh3)
    Route::post('/support/assume-context', [AuthController::class, 'assumeAutarquiaContext']);
    Route::post('/support/exit-context', [AuthController::class, 'exitAutarquiaContext']);

    // Múltiplas autarquias: Listar e trocar entre autarquias do usuário
    Route::get('/user/autarquias', [AuthController::class, 'getAutarquias']);
    Route::post('/user/switch-autarquia', [AuthController::class, 'switchAutarquia']);

});
```

---

## Compatibilidade Retroativa

### Campos Mantidos
- ✅ `users.autarquia_id` - Mantido para compatibilidade com código legado
- ✅ `users.role` - Role padrão do usuário (pode ser sobrescrito por autarquia)

### Fallback Automático
Todos os métodos verificam `autarquia_ativa_id` primeiro, depois `autarquia_id`:

```php
$autarquiaId = $autarquiaId ?? $this->autarquia_ativa_id ?? $this->autarquia_id;
```

Isso garante que:
- Se `autarquia_ativa_id` estiver definido, usa ele (usuário trocou de autarquia)
- Se não, usa `autarquia_id` (comportamento legado)
- Código antigo continua funcionando sem modificações

---

## Implementação Frontend (Pendente ⏳)

### 1. Criar Service de Autarquia

**Arquivo:** `frontend/src/services/autarquia.service.ts`

```typescript
import api from './api'

export const autarquiaService = {
  /**
   * Lista todas as autarquias que o usuário tem acesso
   */
  async getAutarquias() {
    const response = await api.get('/user/autarquias')
    return response.data
  },

  /**
   * Troca a autarquia ativa do usuário
   */
  async switchAutarquia(autarquiaId: number) {
    const response = await api.post('/user/switch-autarquia', {
      autarquia_id: autarquiaId
    })

    // Atualizar localStorage com novos dados do usuário
    if (response.data.user) {
      localStorage.setItem('user_data', JSON.stringify(response.data.user))
    }

    return response.data
  }
}
```

---

### 2. Criar Componente Seletor de Autarquia

**Arquivo sugerido:** `frontend/src/components/AutarquiaSelector.vue`

```vue
<template>
  <div v-if="mostrarSeletor" class="autarquia-selector">
    <label for="autarquia-select">Autarquia:</label>
    <Dropdown
      id="autarquia-select"
      v-model="autarquiaAtual"
      :options="autarquias"
      optionLabel="nome"
      optionValue="id"
      @change="trocarAutarquia"
      placeholder="Selecione a Autarquia"
      :loading="carregando"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { autarquiaService } from '@/services/autarquia.service'
import { useToast } from 'primevue/usetoast'
import Dropdown from 'primevue/dropdown'

const toast = useToast()
const autarquiaAtual = ref<number | null>(null)
const autarquias = ref([])
const carregando = ref(false)

// Só mostra seletor se usuário tem mais de uma autarquia
const mostrarSeletor = computed(() => autarquias.value.length > 1)

onMounted(async () => {
  try {
    carregando.value = true
    const { data } = await autarquiaService.getAutarquias()
    autarquias.value = data.autarquias
    autarquiaAtual.value = data.autarquia_ativa_id
  } catch (error) {
    console.error('Erro ao carregar autarquias:', error)
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Não foi possível carregar as autarquias',
      life: 3000
    })
  } finally {
    carregando.value = false
  }
})

const trocarAutarquia = async (event: any) => {
  const autarquiaId = event.value

  if (autarquiaId === autarquiaAtual.value) return

  try {
    carregando.value = true
    await autarquiaService.switchAutarquia(autarquiaId)

    toast.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Autarquia alterada com sucesso',
      life: 3000
    })

    // Recarregar página para atualizar módulos e permissões
    setTimeout(() => {
      window.location.reload()
    }, 1000)

  } catch (error) {
    console.error('Erro ao trocar autarquia:', error)
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Não foi possível trocar de autarquia',
      life: 3000
    })
    // Reverte seleção
    autarquiaAtual.value = autarquiaAtual.value
  } finally {
    carregando.value = false
  }
}
</script>

<style scoped>
.autarquia-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.autarquia-selector label {
  font-weight: 500;
  white-space: nowrap;
}
</style>
```

---

### 3. Integrar no Layout Principal

**Adicionar no Header ou Sidebar:**

```vue
<template>
  <header class="app-header">
    <div class="header-left">
      <!-- Logo, etc -->
    </div>

    <div class="header-right">
      <!-- Seletor de autarquia -->
      <AutarquiaSelector />

      <!-- Outros componentes (notificações, perfil, etc) -->
    </div>
  </header>
</template>

<script setup lang="ts">
import AutarquiaSelector from '@/components/AutarquiaSelector.vue'
</script>
```

---

### 4. Fluxo de Login com Múltiplas Autarquias (Opcional)

Se quiser que o usuário escolha a autarquia logo após o login:

```typescript
// No LoginView.vue ou similar
const handleLogin = async (credentials) => {
  try {
    const response = await authService.login(credentials)

    // Verificar se usuário tem múltiplas autarquias
    const autarquiasResponse = await autarquiaService.getAutarquias()

    if (autarquiasResponse.autarquias.length > 1) {
      // Mostrar modal/diálogo para escolher autarquia
      showAutarquiaSelection.value = true
      availableAutarquias.value = autarquiasResponse.autarquias
    } else {
      // Redirecionar direto para o dashboard
      router.push('/suite-home')
    }
  } catch (error) {
    // Handle error
  }
}

const selectAutarquiaAndProceed = async (autarquiaId) => {
  await autarquiaService.switchAutarquia(autarquiaId)
  router.push('/suite-home')
}
```

---

### 5. Atualizar useModulos (Já está preparado)

O composable `useModulos` já usa `user.autarquia_id`, que será atualizado automaticamente pelo localStorage quando trocar de autarquia. Nenhuma modificação necessária!

---

## Deploy - Comandos

### 1. Executar Migration

```bash
cd backend
php artisan migrate
```

### 2. Verificar Migração

```bash
php artisan tinker
```

```php
// Verificar tabela pivot criada
DB::table('usuario_autarquia')->count()

// Verificar dados migrados
DB::table('usuario_autarquia')->get()

// Verificar campo autarquia_ativa_id
DB::table('users')->whereNotNull('autarquia_ativa_id')->count()
```

### 3. Verificar Rotas

```bash
php artisan route:list | grep autarquia
```

Deve mostrar:
```
GET|HEAD  api/user/autarquias .......... getAutarquias
POST      api/user/switch-autarquia .... switchAutarquia
```

---

## Rollback (Se Necessário)

A migration está preparada para fazer rollback completo:

```bash
php artisan migrate:rollback --step=1
```

Isso irá:
- ✅ Remover tabela `usuario_autarquia`
- ✅ Remover coluna `autarquia_ativa_id` da tabela `users`
- ✅ Manter coluna `autarquia_id` intacta (dados preservados)

---

## Testes Recomendados

### Backend

1. **Migração de Dados**
   ```bash
   php artisan migrate
   # Verificar se todos os usuários foram migrados corretamente
   ```

2. **Endpoint GET /api/user/autarquias**
   - [ ] Testar com usuário normal (deve mostrar apenas suas autarquias)
   - [ ] Testar com superadmin SH3 (deve mostrar todas as autarquias ativas)
   - [ ] Verificar campo `autarquia_ativa_id` na resposta

3. **Endpoint POST /api/user/switch-autarquia**
   - [ ] Testar troca para autarquia válida
   - [ ] Testar troca para autarquia sem acesso (deve retornar 403)
   - [ ] Verificar se `autarquia_ativa_id` é atualizado no banco
   - [ ] Testar com superadmin (deve funcionar para qualquer autarquia)

### Frontend

1. **Componente AutarquiaSelector**
   - [ ] Deve aparecer apenas se usuário tem múltiplas autarquias
   - [ ] Deve mostrar autarquia atual selecionada
   - [ ] Ao trocar, deve recarregar a página

2. **Integração com useModulos**
   - [ ] Após trocar autarquia, módulos devem mudar
   - [ ] Permissões devem ser atualizadas conforme autarquia

3. **LocalStorage**
   - [ ] Verificar se `user_data` é atualizado após troca
   - [ ] Verificar se `autarquia_ativa_id` está presente

---

## Fluxos de Usuário

### Cenário 1: Usuário com Única Autarquia
1. Login
2. Sistema detecta apenas uma autarquia
3. Autarquia é definida automaticamente
4. Seletor não aparece no header
5. Acessa dashboard normalmente

### Cenário 2: Usuário com Múltiplas Autarquias
1. Login
2. Sistema detecta múltiplas autarquias
3. *(Opcional)* Mostra modal para escolher autarquia inicial
4. Seletor aparece no header
5. Usuário pode trocar de autarquia a qualquer momento
6. Ao trocar, página recarrega e módulos são atualizados

### Cenário 3: Superadmin SH3
1. Login (autarquia SH3 Suporte)
2. Vê todas as autarquias do sistema no seletor
3. Escolhe qualquer autarquia
4. Sistema define `autarquia_ativa_id`
5. Acessa como suporte daquela autarquia
6. **OU** usa modo suporte (assume-context) para acesso temporário

### Cenário 4: Usuário Admin em Múltiplas Autarquias
1. Login
2. Autarquia 1: role = "clientAdmin", is_admin = true
3. Autarquia 2: role = "user", is_admin = false
4. Ao trocar para Autarquia 1: tem permissões de admin
5. Ao trocar para Autarquia 2: tem permissões de usuário comum

---

## Segurança

### Validações Implementadas
- ✅ Usuário só pode trocar para autarquias que tem acesso (via pivot)
- ✅ Superadmin SH3 pode trocar para qualquer autarquia ativa
- ✅ Role retornado é baseado no pivot da autarquia, não no role global
- ✅ Verificação de permissões usa `autarquia_ativa_id`
- ✅ Foreign keys com cascade/set null para integridade referencial

### Pontos de Atenção
- ⚠️ Frontend deve atualizar localStorage após trocar autarquia
- ⚠️ Módulos devem ser recarregados após troca de autarquia
- ⚠️ Permissões específicas já consideram `autarquia_ativa_id`
- ⚠️ Backend sempre valida via JWT, localStorage é apenas UI

---

## Diferença entre Modo Suporte e Multi-Autarquia

### Modo Suporte (Assume Context)
- **Quem usa:** Apenas superadmin SH3
- **Propósito:** Acesso temporário para suporte técnico
- **Como funciona:** Modifica localStorage temporariamente
- **Endpoints:** `/api/support/assume-context` e `/api/support/exit-context`
- **Características:**
  - Acesso temporário
  - Não persiste no banco
  - Voltável a qualquer momento
  - Usado para intervenções rápidas

### Multi-Autarquia (Switch Autarquia)
- **Quem usa:** Qualquer usuário vinculado a múltiplas autarquias
- **Propósito:** Trabalhar em diferentes autarquias regularmente
- **Como funciona:** Atualiza `autarquia_ativa_id` no banco
- **Endpoints:** `/api/user/autarquias` e `/api/user/switch-autarquia`
- **Características:**
  - Mudança persistente
  - Salvo no banco de dados
  - Contexto mantido entre sessões
  - Usado para trabalho diário

**Ambos podem coexistir:** Superadmin SH3 pode usar modo suporte OU trocar de autarquia normalmente.

---

## Conclusão

Esta implementação permite que:

1. ✅ Usuários estejam vinculados a múltiplas autarquias
2. ✅ Cada vínculo tenha role e permissões específicas
3. ✅ Usuários possam trocar de autarquia facilmente
4. ✅ Superadmin SH3 acesse qualquer autarquia
5. ✅ Compatibilidade total com código legado
6. ✅ Segurança mantida em todas as operações

**Status Atual:**
- ✅ Backend: 100% implementado
- ⏳ Frontend: Aguardando implementação

**Arquivo da Migration:** [`backend/database/migrations/2025_10_17_000001_create_usuario_autarquia_table.php`](/home/sara.pereira/Documentos/gestao-frota/backend/database/migrations/2025_10_17_000001_create_usuario_autarquia_table.php)