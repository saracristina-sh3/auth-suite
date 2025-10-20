# SuiteHome - Seletor de Autarquia

## 📋 Visão Geral

Implementação do **seletor de autarquia** no SuiteHome usando o componente **Sh3Select**. O comportamento é adaptativo:
- **1 autarquia:** Mostra apenas o nome em um card estilizado
- **Múltiplas autarquias:** Mostra seletor interativo com Sh3Select

## ✨ Funcionalidades Implementadas

### 1. Detecção Automática
- ✅ Carrega autarquias do usuário ao montar componente
- ✅ Detecta quantas autarquias o usuário possui
- ✅ Renderiza interface apropriada

### 2. Autarquia Única
```vue
<!-- Card estilizado com gradient -->
<div class="autarquia-card-single">
  <i class="pi pi-building"></i>
  <div>
    <p>Autarquia</p>
    <p>{{ autarquias[0].nome }}</p>
  </div>
</div>
```

**Visual:**
- Gradient roxo/azul (667eea → 764ba2)
- Ícone de prédio
- Nome da autarquia em destaque
- Efeito hover sutil

### 3. Múltiplas Autarquias
```vue
<!-- Seletor com Sh3Select -->
<Sh3Select
  :field="{
    name: 'autarquia_ativa',
    type: 'select',
    placeholder: 'Escolha uma autarquia para trabalhar',
    options: autarquias,
    optionLabel: 'nome',
    optionValue: 'id'
  }"
  v-model="autarquiaAtivaId"
  @update:modelValue="handleAutarquiaChange"
/>
```

**Visual:**
- Card branco com borda
- Título "Selecione a Autarquia"
- Dropdown Sh3Select
- Footer mostrando autarquia selecionada

### 4. Lógica de Seleção Automática

```typescript
// Prioridade de seleção:
1. autarquia_ativa_id do usuário (já definida)
2. Se tem apenas 1 autarquia → seleciona automaticamente
3. Se tem múltiplas → busca a padrão (is_default: true)
4. Caso contrário → usuário deve selecionar
```

### 5. Troca de Autarquia
```typescript
async function handleAutarquiaChange(newAutarquiaId: number) {
  // 1. Atualiza no backend
  await userService.updateActiveAutarquia(userId, newAutarquiaId)

  // 2. Atualiza localStorage
  const updatedUser = await authService.getCurrentUser()

  // 3. Recarrega módulos da nova autarquia
  await reload()
}
```

## 🎨 Design e Estilos

### Card de Autarquia Única
```css
.autarquia-card-single {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 1.5rem;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}
```

### Card Seletor (Múltiplas)
```css
.autarquia-selector-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
```

### Footer de Confirmação
```css
.autarquia-info-footer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.info-text {
  color: #10b981; /* Verde success */
  gap: 0.5rem;
}
```

## 📊 Fluxo de Dados

```
┌─────────────────────────────────┐
│  onMounted()                    │
│  ↓                              │
│  loadUserAutarquias()           │
│  ↓                              │
│  userService.getUserAutarquias()│
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Lógica de Seleção Automática   │
│  ↓                              │
│  1. user.autarquia_ativa_id?    │
│  2. autarquias.length === 1?    │
│  3. is_default === true?        │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Renderização Condicional       │
│  ↓                              │
│  v-if="autarquias.length === 1" │
│     → Card Único                │
│  v-else-if="length > 1"         │
│     → Sh3Select                 │
└─────────────────────────────────┘
```

## 🔄 Mudança de Autarquia

```
Usuário Seleciona Nova Autarquia
    ↓
handleAutarquiaChange(newId)
    ↓
updateActiveAutarquia(newId)
    ↓
userService.updateActiveAutarquia()
    ↓
PUT /api/users/{id}/active-autarquia
    ↓
authService.getCurrentUser()
    ↓
Atualiza currentUser.value
    ↓
reload() - Recarrega módulos
    ↓
useModulos() busca módulos da nova autarquia
```

## 💡 Exemplos de Uso

### Cenário 1: Usuário com 1 Autarquia

```typescript
// Dados do usuário
{
  id: 1,
  name: "João Silva",
  autarquia_ativa_id: 1,
  autarquias: [
    { id: 1, nome: "Prefeitura Municipal", pivot: {...} }
  ]
}
```

**Resultado:**
```
┌─────────────────────────────────────┐
│  🏢  AUTARQUIA                      │
│      Prefeitura Municipal           │
└─────────────────────────────────────┘
```

### Cenário 2: Usuário com Múltiplas Autarquias

```typescript
// Dados do usuário
{
  id: 2,
  name: "Maria Santos",
  autarquia_ativa_id: 2,
  autarquias: [
    { id: 1, nome: "Prefeitura Municipal", pivot: {...} },
    { id: 2, nome: "Câmara Municipal", pivot: { is_default: true } },
    { id: 3, nome: "Secretaria de Educação", pivot: {...} }
  ]
}
```

**Resultado:**
```
┌─────────────────────────────────────┐
│  🏢  Selecione a Autarquia          │
│  ┌───────────────────────────────┐  │
│  │ Câmara Municipal            ▼ │  │
│  └───────────────────────────────┘  │
│  ─────────────────────────────────  │
│  ✓ Trabalhando em: Câmara Municipal │
└─────────────────────────────────────┘
```

### Cenário 3: Sem Autarquias

```typescript
// Dados do usuário
{
  id: 3,
  name: "Pedro Costa",
  autarquias: []
}
```

**Resultado:**
```
┌─────────────────────────────────────┐
│  ⚠️ Você não está vinculado a       │
│     nenhuma autarquia. Entre em     │
│     contato com o administrador.    │
└─────────────────────────────────────┘
```

## 🔧 Integração com Backend

### Endpoint Usado
```
GET /api/users/{userId}/autarquias
PUT /api/users/{userId}/active-autarquia
```

### Resposta Esperada
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nome": "Prefeitura Municipal",
      "ativo": true,
      "pivot": {
        "role": "admin",
        "is_admin": true,
        "is_default": true,
        "ativo": true,
        "data_vinculo": "2025-01-15T10:00:00Z"
      }
    }
  ]
}
```

## 🎯 Estados de Loading

### Loading Autarquias
```vue
<div v-else-if="loadingAutarquias" class="autarquia-loading">
  <ProgressSpinner style="width: 30px; height: 30px" />
  <span class="ml-2">Carregando autarquias...</span>
</div>
```

### Loading Módulos
```vue
<div v-if="loading" class="loading-container">
  <ProgressSpinner />
  <p class="text-color-secondary mt-3">Carregando módulos...</p>
</div>
```

## 📱 Responsividade

```css
@media (max-width: 768px) {
  .autarquia-selector {
    max-width: 100%;
  }

  .autarquia-card-single {
    padding: 1.25rem;
  }

  .autarquia-card-single .nome-autarquia {
    font-size: 1.25rem;
  }

  .selector-title {
    font-size: 1rem;
  }
}
```

## 🐛 Tratamento de Erros

### Erro ao Carregar Autarquias
```typescript
try {
  autarquias.value = await userService.getUserAutarquias(user.id)
} catch (err) {
  console.error('❌ Erro ao carregar autarquias:', err)
  // Autarquias fica vazio → mostra mensagem de aviso
}
```

### Erro ao Mudar Autarquia
```typescript
try {
  await userService.updateActiveAutarquia(user.id, autarquiaId)
} catch (err) {
  console.error('❌ Erro ao atualizar autarquia ativa:', err)
  // Reverte para autarquia anterior
  autarquiaAtivaId.value = currentUser.value?.autarquia_ativa_id || null
}
```

## ✅ Checklist de Implementação

- [x] Integração com userService.getUserAutarquias()
- [x] Detecção automática de quantidade de autarquias
- [x] Card estilizado para autarquia única
- [x] Sh3Select para múltiplas autarquias
- [x] Seleção automática baseada em prioridades
- [x] Método de troca de autarquia
- [x] Atualização de localStorage
- [x] Recarga de módulos ao trocar
- [x] Estados de loading
- [x] Tratamento de erros
- [x] Responsividade mobile
- [x] Animações suaves

## 🚀 Próximos Passos

1. **Notificação de Troca**
   - Toast ao trocar de autarquia com sucesso
   - Feedback visual mais rico

2. **Persistência**
   - Manter seleção ao recarregar página
   - Sincronizar com backend automaticamente

3. **Analytics**
   - Rastrear trocas de autarquia
   - Estatísticas de uso por autarquia

4. **Otimizações**
   - Cache de autarquias
   - Debounce na troca
   - Preload de módulos

## 📚 Arquivos Relacionados

- [SuiteHome.vue](frontend/src/components/SuiteHome.vue)
- [Sh3Select.vue](frontend/src/components/common/Sh3Select.vue)
- [user.service.ts](frontend/src/services/user.service.ts)
- [auth.service.ts](frontend/src/services/auth.service.ts)

---

## 🎉 Conclusão

A implementação está **completa e funcional**! O SuiteHome agora:

✅ Detecta automaticamente quantas autarquias o usuário possui
✅ Mostra interface apropriada (card ou seletor)
✅ Permite troca fácil de autarquia
✅ Recarrega módulos automaticamente
✅ Tem design responsivo e moderno
✅ Trata erros adequadamente

**Pronto para uso em produção!** 🚀
