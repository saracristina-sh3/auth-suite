# TODO - Auth Suite - Melhorias e Implementações

> **Última atualização**: 25 de Outubro de 2025
> **Status**: Projeto em desenvolvimento ativo
> **Análise completa**: Ver `/tmp/analise_auth_suite.md`

---

## 🚨 PRIORIDADE CRÍTICA (Fazer AGORA)

### 1. Segurança e Tratamento de Erros

- [x] **Implementar Error Handler Centralizado** ✅ **CONCLUÍDO**
  - [x] Criar `src/utils/error-handler.ts` com função para extrair mensagens da API
  - [x] Processar erros de validação (422) com array de errors
  - [x] Processar erros de autenticação (401)
  - [x] Processar erros de autorização (403)
  - [x] Processar erros de servidor (500)
  - [x] Atualizar `error.utils.ts` para usar novo handler
  - [x] Refatorar composables principais para usar handler centralizado
  - **Arquivos refatorados**:
    - ✅ `error.utils.ts`
    - ✅ `useSaveHandler.ts`
    - ✅ `useDataLoader.ts`
    - ✅ `useUserAutarquias.ts`
    - ✅ `useSupportContext.ts`
  - **Arquivos pendentes**: services, views/components (ver `ERROR_HANDLER_MIGRATION.md`)
  - **Tempo gasto**: ~3 horas
  - **Documentação**: Ver `src/utils/ERROR_HANDLER_MIGRATION.md`

- [ ] **Implementar Refresh Token**
  - [ ] Backend: Criar endpoint `/auth/refresh`
  - [ ] Backend: Retornar refresh_token no login
  - [ ] Frontend: Armazenar refresh_token separadamente
  - [ ] Frontend: Interceptor 401 tenta refresh antes de logout
  - [ ] Frontend: Fallback para login se refresh falhar
  - **Arquivos**: `backend/app/Http/Controllers/Api/AuthController.php`, `frontend/src/services/api.ts`
  - **Tempo estimado**: 6-8 horas

- [ ] **Migrar Token para HttpOnly Cookie (Opcional, Avançado)**
  - [ ] Backend: Configurar CSRF protection
  - [ ] Backend: Retornar token via cookie HttpOnly
  - [ ] Frontend: Remover token de localStorage
  - [ ] Frontend: Usar credenciais em requisições
  - **Tempo estimado**: 8-10 horas
  - **Nota**: Pode conflitar com arquitetura atual, avaliar necessidade

### 2. Validações de Input

- [ ] **Adicionar Validações de CPF**
  - [ ] Frontend: Criar função `validateCPF()` em `src/utils/validators.ts`
  - [ ] Frontend: Aplicar validação em `useUserTableConfig.ts`
  - [ ] Backend: Adicionar validação de CPF em `UserController::store/update`
  - **Arquivos**: `validators.ts`, `useUserTableConfig.ts`, `UserController.php`
  - **Tempo estimado**: 2-3 horas

- [ ] **Adicionar Validações de Email**
  - [ ] Frontend: Pattern regex para email em `useUserTableConfig.ts`
  - [ ] Frontend: Feedback visual de email inválido
  - **Arquivos**: `useUserTableConfig.ts`
  - **Tempo estimado**: 1 hora

- [ ] **Adicionar Confirmação de Ações Destrutivas**
  - [ ] Criar componente `ConfirmDialog.vue`
  - [ ] Integrar em `Sh3Table.vue` antes de delete
  - [ ] Adicionar confirmação em delete de usuários, autarquias, módulos
  - **Arquivos**: Novo componente + `Sh3Table.vue`
  - **Tempo estimado**: 3-4 horas

### 3. Padronizar Resposta da API

- [ ] **Padronizar Formato de Resposta**
  - [ ] Backend: Criar trait `ApiResponses` para padronizar respostas
  - [ ] Backend: Aplicar em todos os controllers
  - [ ] Decidir formato padrão:
    ```json
    {
      "success": boolean,
      "message": string,
      "data": T | T[] | null,
      "meta"?: { current_page, last_page, per_page, total },
      "errors"?: { field: [string] }
    }
    ```
  - [ ] Frontend: Atualizar todos os services para novo padrão
  - **Arquivos**: Todos os controllers + todos os services
  - **Tempo estimado**: 8-12 horas
  - **Nota**: Mudança grande, fazer em branch separada

---

## 🔥 PRIORIDADE ALTA (Próxima Sprint - 1-2 semanas)

### 4. Testes

- [ ] **Implementar Testes Unitários - Services**
  - [ ] `auth.service.spec.ts` - Login, logout, getUser
  - [ ] `user.service.spec.ts` - CRUD completo
  - [ ] `autarquia.service.spec.ts` - List, create, update
  - [ ] `modulos.service.spec.ts` - List, create, update
  - [ ] `support.service.spec.ts` - assumeContext, exitContext
  - **Pasta**: `src/services/__tests__/`
  - **Tempo estimado**: 10-15 horas

- [ ] **Implementar Testes Unitários - Composables**
  - [ ] `useSaveHandler.spec.ts` - Lógica de save para cada entidade
  - [ ] `useModulos.spec.ts` - Carregamento e cache
  - [ ] `useSupportContext.spec.ts` - Assume e exit context
  - [ ] `useDataLoader.spec.ts` - Loading states
  - **Pasta**: `src/composables/__tests__/`
  - **Tempo estimado**: 8-12 horas

- [ ] **Implementar Testes E2E**
  - [ ] Configurar Cypress/Playwright
  - [ ] Teste: Fluxo de login
  - [ ] Teste: Criar usuário
  - [ ] Teste: Editar usuário
  - [ ] Teste: Modo suporte (assumir contexto)
  - [ ] Teste: Sair do modo suporte
  - [ ] Teste: Logout
  - **Pasta**: `cypress/e2e/` ou `e2e/`
  - **Tempo estimado**: 12-16 horas

- [ ] **Backend - Testes com PHPUnit**
  - [ ] Testes para `AuthController`
  - [ ] Testes para `UserController`
  - [ ] Testes para `AutarquiaController`
  - [ ] Testes para `ModuloController`
  - **Pasta**: `backend/tests/Feature/`
  - **Tempo estimado**: 12-18 horas

### 5. Refatoração de Composables

- [ ] **Separar useSaveHandler**
  - [ ] Criar `useSaveUser.ts` com lógica específica de usuário
  - [ ] Criar `useSaveAutarquia.ts` com lógica específica de autarquia
  - [ ] Criar `useSaveModulo.ts` com lógica específica de módulo
  - [ ] Remover `useSaveHandler.ts`
  - [ ] Atualizar `AdminManagementView.vue` para usar novos composables
  - **Arquivos**: Novos composables + `AdminManagementView.vue`
  - **Tempo estimado**: 4-6 horas

### 6. TypeScript - Remover `any` Types

- [ ] **Tipificar Services**
  - [ ] `autarquia-modulo.service.ts` linha 45: `erros: any[]` → `erros: string[]`
  - [ ] `permission.service.ts` linha 43: `params: any` → `params: PermissionQueryParams`
  - [ ] `support.service.ts` linha 118: `error: any` → `error: unknown`
  - **Tempo estimado**: 2-3 horas

- [ ] **Tipificar Composables**
  - [ ] `useSaveHandler.ts` linha 21: `data: any` → Union type específico
  - [ ] `useModulosSupport.ts`: Verificar e tipar
  - **Tempo estimado**: 2-3 horas

- [ ] **Tipificar Componentes**
  - [ ] `Sh3Form.vue` linha 124: `editingItem: Record<string, any>` → Generic type
  - [ ] `Sh3Select.vue`: `modelValue: any` → Generic type
  - [ ] `UserTab.vue`: Remover casts `as any`
  - **Tempo estimado**: 3-4 horas

- [ ] **Tipificar Tipos Compartilhados**
  - [ ] `table.types.ts` linha 28: `options?: any[]` → `options?: SelectOption[]`
  - [ ] Criar interface `SelectOption { label: string, value: any }`
  - **Tempo estimado**: 1-2 horas

- [ ] **Habilitar TypeScript Strict Mode**
  - [ ] Atualizar `tsconfig.json` com `"strict": true`
  - [ ] Corrigir todos os erros resultantes
  - **Tempo estimado**: 6-10 horas

### 7. UX - Loading States e Feedback

- [ ] **Adicionar Loading States**
  - [ ] `Sh3Table.vue`: Adicionar spinner durante carregamento
  - [ ] `Sh3Form.vue`: Desabilitar botão submit durante salvamento
  - [ ] `AdminManagementView.vue`: Loading indicator global
  - **Tempo estimado**: 3-4 horas

- [ ] **Adicionar Estados Vazios Diferenciados**
  - [ ] Usar `Sh3EmptyState.vue` em todas as tabelas
  - [ ] Diferenciar: "Carregando", "Vazio", "Erro"
  - [ ] Adicionar ilustrações ou ícones
  - **Tempo estimado**: 2-3 horas

- [ ] **Melhorar Mensagens de Erro**
  - [ ] Criar dicionário de mensagens amigáveis
  - [ ] Adicionar instruções de como resolver
  - [ ] Diferenciar cores: validação (amarelo), erro (vermelho), aviso (laranja)
  - **Tempo estimado**: 3-4 horas

---

## 📊 PRIORIDADE MÉDIA (Próximas 2-4 semanas)

### 8. Performance e Cache

- [ ] **Implementar Cache de Módulos**
  - [ ] `useModulos.ts`: Verificar se módulos já carregados antes de buscar API
  - [ ] Adicionar TTL de 5 minutos
  - [ ] Implementar invalidação manual
  - **Tempo estimado**: 3-4 horas

- [ ] **Implementar Cache de Autarquias**
  - [ ] Similar ao cache de módulos
  - [ ] Cache no backend (Redis ou Laravel Cache)
  - **Tempo estimado**: 4-6 horas

- [ ] **Otimizar Chamadas Paralelas**
  - [ ] `AdminManagementView.vue`: Usar `Promise.all()` para carregar dados
  - [ ] Evitar await sequencial desnecessário
  - **Tempo estimado**: 2 horas

- [ ] **Implementar Paginação Server-side**
  - [ ] Backend: Já tem paginação em users
  - [ ] Frontend: Adicionar em autarquias e módulos
  - [ ] `Sh3Table.vue`: Suportar paginação server-side
  - **Tempo estimado**: 6-8 horas

- [ ] **Otimizar N+1 Queries (Backend)**
  - [ ] Revisar todos os controllers
  - [ ] Usar eager loading onde necessário
  - [ ] Adicionar índices em migrations
  - **Tempo estimado**: 4-6 horas

### 9. Código Duplicado

- [ ] **Criar Função Utilitária para localStorage**
  - [ ] `src/utils/storage.ts`: `getItem()`, `setItem()`, `removeItem()`
  - [ ] Safe JSON parse/stringify
  - [ ] Substituir todos os usos diretos de localStorage
  - **Tempo estimado**: 3-4 horas

- [ ] **Centralizar Lógica de Token**
  - [ ] Backend: Trait `CreatesTokens`
  - [ ] Frontend: Service `token.service.ts`
  - **Tempo estimado**: 2-3 horas

### 10. Componentização

- [ ] **Dividir AdminManagementView.vue**
  - [ ] Criar `UserManagementSection.vue`
  - [ ] Criar `AutarquiaManagementSection.vue`
  - [ ] Criar `ModuloManagementSection.vue`
  - [ ] AdminManagementView se torna orquestrador
  - **Tempo estimado**: 6-8 horas

- [ ] **Refatorar Sh3Form.vue**
  - [ ] Dividir em formulários específicos
  - [ ] `UserForm.vue`, `AutarquiaForm.vue`, `ModuloForm.vue`
  - [ ] Adicionar validações inline
  - **Tempo estimado**: 8-10 horas

### 11. Documentação

- [ ] **Adicionar JSDoc em Services**
  - [ ] `user.service.ts`: Documentar todos os métodos
  - [ ] `autarquia.service.ts`: Documentar todos os métodos
  - [ ] `modulos.service.ts`: Documentar todos os métodos
  - [ ] Todos os outros services
  - **Tempo estimado**: 4-6 horas

- [ ] **Documentar Tipos Complexos**
  - [ ] `user.types.ts`: Explicar `autarquia_preferida_id` vs `autarquia_ativa_id`
  - [ ] `use-autarquia-pivot.types.ts`: Documentar pivot data
  - [ ] `support.types.ts`: Documentar SupportContext
  - **Tempo estimado**: 2-3 horas

- [ ] **Criar Guias de Desenvolvimento**
  - [ ] `docs/DEVELOPMENT.md`: Como adicionar novo service
  - [ ] `docs/COMPOSABLES.md`: Como criar novo composable
  - [ ] `docs/COMPONENTS.md`: Padrões de componentes
  - [ ] `docs/TESTING.md`: Como escrever testes
  - **Tempo estimado**: 6-8 horas

- [ ] **Criar Diagramas de Fluxo**
  - [ ] Fluxo de autenticação
  - [ ] Fluxo de modo suporte
  - [ ] Estrutura de dados de autarquias
  - [ ] Usar Mermaid ou Draw.io
  - **Tempo estimado**: 4-6 horas

- [ ] **README do Backend**
  - [ ] Estrutura de pastas
  - [ ] Controllers e Models
  - [ ] Migrations
  - [ ] Como executar testes
  - **Tempo estimado**: 2-3 horas

---

## 🎨 PRIORIDADE BAIXA (Backlog - Quando houver tempo)

### 12. Features Incompletas

- [ ] **Implementar Edição de Perfil**
  - [ ] `PerfilView.vue`: Adicionar formulário de edição
  - [ ] Backend: Endpoint `/profile/update`
  - [ ] Validações
  - [ ] Upload de avatar (opcional)
  - **Tempo estimado**: 6-8 horas

- [ ] **Implementar Recuperação de Senha**
  - [ ] Backend: Endpoint `/auth/forgot-password`
  - [ ] Backend: Endpoint `/auth/reset-password`
  - [ ] Frontend: View `ForgotPasswordView.vue`
  - [ ] Frontend: View `ResetPasswordView.vue`
  - [ ] Email com link de reset
  - **Tempo estimado**: 10-12 horas

- [ ] **Implementar Dashboard de Suporte**
  - [ ] `DashboardTab.vue`: Adicionar gráficos
  - [ ] Estatísticas de uso
  - [ ] Logs de ações
  - [ ] Usar Chart.js ou similar
  - **Tempo estimado**: 12-16 horas

- [ ] **Finalizar Links do Rodapé**
  - [ ] Criar páginas institucionais
  - [ ] Links funcionais
  - **Tempo estimado**: 4-6 horas

- [ ] **Implementar Theme Switcher**
  - [ ] Integrar `ThemeSwitcher.vue`
  - [ ] Persistir preferência
  - [ ] Temas: light, dark, auto
  - **Tempo estimado**: 3-4 horas

### 13. Melhorias de UX

- [ ] **Sincronização Entre Abas**
  - [ ] Usar `StorageEvent` para detectar mudanças em localStorage
  - [ ] Ou migrar para Pinia com persistência
  - [ ] Sincronizar autarquia ativa entre abas
  - **Tempo estimado**: 4-6 horas

- [ ] **Rate Limiting no Frontend**
  - [ ] Debounce em botões de submit
  - [ ] Throttle em requests de busca
  - [ ] Feedback visual
  - **Tempo estimado**: 2-3 horas

- [ ] **Sanitização de Mensagens de Erro**
  - [ ] Remover HTML de mensagens da API
  - [ ] Prevenir XSS via mensagens de erro
  - **Tempo estimado**: 1-2 horas

### 14. Melhorias de Segurança

- [ ] **Implementar CSRF Protection**
  - [ ] Backend: Middleware CSRF
  - [ ] Frontend: Incluir token CSRF em requests
  - **Tempo estimado**: 3-4 horas

- [ ] **Auditar Permissões no Frontend**
  - [ ] Router guards mais granulares
  - [ ] Verificar permissões específicas além de `is_superadmin`
  - **Tempo estimado**: 4-6 horas

---

## 📈 Métricas de Progresso

### Estatísticas do Projeto (Baseline)
- **Testes Unitários**: 0 / ~50 (0%)
- **Testes E2E**: 0 / ~10 (0%)
- **Tipos `any`**: ~15 ocorrências
- **Coverage**: 0%
- **Componentes Grandes**: 3 (AdminManagementView, Sh3Form, Sh3Table)
- **Composables com Múltiplas Responsabilidades**: 1 (useSaveHandler)

### Metas
- [ ] **90%+ de cobertura de testes**
- [ ] **0 tipos `any` no código de produção**
- [ ] **Componentes < 200 linhas**
- [ ] **Composables com responsabilidade única**
- [ ] **API 100% padronizada**
- [ ] **Documentação completa**

---

## 📝 Notas

- **Branch para trabalho**: Criar branches feature/... para cada item grande
- **Code Review**: Revisar pull requests antes de merge
- **Testes**: Executar testes antes de cada commit
- **Documentação**: Atualizar docs junto com código

---

## 🚀 Próximos Passos Imediatos

1. ✅ Corrigir erro de `can't access property "items"` (FEITO)
2. ✅ Corrigir erros de TypeScript (FEITO)
3. ⏳ **PRÓXIMO**: Implementar Error Handler Centralizado
4. ⏳ Adicionar validações de CPF e Email
5. ⏳ Implementar Refresh Token

---

**Última revisão**: 25/10/2025
**Responsável**: Equipe de Desenvolvimento
**Documento de análise**: `/tmp/analise_auth_suite.md`
