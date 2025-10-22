# 🎨 Guia de Cores - Sistema de Gestão SH3

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Paleta de Cores SH3](#paleta-de-cores-sh3)
3. [Cores Semânticas](#cores-semânticas)
4. [Como Usar](#como-usar)
5. [Acessibilidade](#acessibilidade)
6. [Exemplos de Uso](#exemplos-de-uso)

---

## Visão Geral

Este projeto utiliza um **sistema de design baseado em tokens CSS** que permite:
- ✅ Consistência visual em toda a aplicação
- ✅ Suporte a temas claro e escuro
- ✅ Fácil manutenção e personalização
- ✅ Acessibilidade garantida (WCAG AA)

### Princípios de Uso

1. **SEMPRE** use cores semânticas (`primary`, `secondary`, `destructive`, etc.)
2. **NUNCA** use cores hardcoded (`#3b82f6`, `rgb(59, 130, 246)`)
3. **PREFIRA** classes Tailwind semânticas (`bg-primary`, `text-foreground`)
4. **EVITE** classes Tailwind específicas (`bg-blue-600`, `text-red-500`)

---

## Paleta de Cores SH3

### 🟢 Jade (Verde-azulado) - Cor Primária
**Uso:** Ações principais, botões primários, links, elementos de destaque

```css
jade-50  to jade-950 (mais escuro)
```

**Quando usar:**
- Botões de ação principal ("Salvar", "Confirmar", "Adicionar")
- Links clicáveis
- Elementos interativos importantes
- Ícones de sucesso

### 🔵 Selenium (Azul) - Cor Secundária
**Uso:** Informações, elementos secundários, badges informativos

```css
selenium-50 to selenium-950
```

**Quando usar:**
- Botões secundários
- Mensagens informativas
- Headers e títulos secundários
- Elementos de navegação

### 🟠 Copper (Laranja)
**Uso:** Elementos de destaque especial, CTAs alternativos

```css
copper-50 to copper-950
```

**Quando usar:**
- Badges de status especial
- Elementos de destaque que não sejam ações principais
- Indicadores numéricos importantes

### 🔴 Ruby (Vermelho) - Destrutivo/Erro
**Uso:** Ações destrutivas, erros, alertas críticos

```css
ruby-50 to ruby-950
```

**Quando usar:**
- Botões de exclusão ("Deletar", "Remover", "Cancelar")
- Mensagens de erro
- Validações com falha
- Alertas críticos

### 🟡 Sulfur (Amarelo) - Aviso
**Uso:** Avisos, alertas não críticos

```css
sulfur-50 to sulfur-950
```

**Quando usar:**
- Mensagens de aviso
- Indicadores de atenção necessária
- Status pendentes

---

## Cores Semânticas

### Cores de Ação

| Variável | Uso | Exemplo |
|----------|-----|---------|
| `--primary` | Ação principal | Botão "Salvar" |
| `--secondary` | Ação secundária | Botão "Cancelar" |
| `--destructive` | Ação destrutiva | Botão "Deletar" |
| `--warning` | Aviso | Mensagem de atenção |
| `--success` | Sucesso | Confirmação de ação |
| `--info` | Informação | Banner informativo |

### Cores de Estado

| Variável | Uso | Exemplo |
|----------|-----|---------|
| `--primary-hover` | Hover em primário | Botão ao passar mouse |
| `--primary-active` | Active em primário | Botão ao clicar |
| `--primary-disabled` | Primário desabilitado | Botão inativo |

### Cores de Interface

| Variável | Uso | Exemplo |
|----------|-----|---------|
| `--background` | Fundo da página | Body |
| `--foreground` | Texto principal | Parágrafos |
| `--card` | Fundo de cards | Componente Card |
| `--border` | Bordas | Divisores |
| `--input` | Fundo de inputs | Campos de formulário |
| `--muted` | Elementos desabilitados | Texto secundário |

---

## Como Usar

### ✅ Correto - Usando Classes Tailwind Semânticas

```vue
<template>
  <!-- Botão primário -->
  <button class="bg-primary text-primary-foreground hover:bg-primary-hover">
    Salvar
  </button>

  <!-- Botão destrutivo -->
  <button class="bg-destructive text-destructive-foreground hover:bg-destructive-hover">
    Deletar
  </button>

  <!-- Card -->
  <div class="bg-card text-card-foreground border border-border">
    Conteúdo do card
  </div>

  <!-- Input -->
  <input class="border-input focus:border-input-focus bg-background text-foreground">
</template>
```

### ✅ Correto - Usando CSS Variables

```vue
<template>
  <div class="custom-component">
    Conteúdo
  </div>
</template>

<style scoped>
.custom-component {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border: 1px solid hsl(var(--border));
}

.custom-component:hover {
  background-color: hsl(var(--primary-hover));
}
</style>
```

### ✅ Correto - Usando Paleta SH3

```vue
<template>
  <!-- Badge de sucesso -->
  <span class="bg-jade-100 text-jade-800 border-jade-300">
    Ativo
  </span>

  <!-- Badge de erro -->
  <span class="bg-ruby-100 text-ruby-800 border-ruby-300">
    Erro
  </span>

  <!-- Badge de aviso -->
  <span class="bg-sulfur-100 text-sulfur-800 border-sulfur-300">
    Pendente
  </span>
</template>
```

### ❌ Errado - Cores Hardcoded

```vue
<!-- NÃO FAÇA ISSO -->
<button class="bg-blue-600 text-white">Salvar</button>
<div style="background: #3b82f6">Conteúdo</div>
<span class="text-red-500">Erro</span>
```

---

## Acessibilidade

### Contraste de Cores

Todas as combinações de cores seguem os padrões WCAG AA:
- **Texto normal:** Contraste mínimo de 4.5:1
- **Texto grande:** Contraste mínimo de 3:1
- **Elementos de UI:** Contraste mínimo de 3:1

### Combinações Aprovadas

| Fundo | Texto | Contraste | Status |
|-------|-------|-----------|--------|
| `primary` | `primary-foreground` | 7.2:1 | ✅ AAA |
| `secondary` | `secondary-foreground` | 6.8:1 | ✅ AAA |
| `destructive` | `destructive-foreground` | 5.1:1 | ✅ AA |
| `background` | `foreground` | 16.1:1 | ✅ AAA |

### Estados de Foco

Todos os elementos interativos devem ter um indicador de foco visível:

```vue
<button class="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
  Botão Acessível
</button>
```

---

## Exemplos de Uso

### Botões

```vue
<template>
  <!-- Primário -->
  <button class="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary-hover">
    Ação Principal
  </button>

  <!-- Secundário -->
  <button class="px-4 py-2 rounded bg-secondary text-secondary-foreground hover:bg-secondary-hover">
    Ação Secundária
  </button>

  <!-- Destrutivo -->
  <button class="px-4 py-2 rounded bg-destructive text-destructive-foreground hover:bg-destructive-hover">
    Deletar
  </button>

  <!-- Outline -->
  <button class="px-4 py-2 rounded border border-primary text-primary hover:bg-primary hover:text-primary-foreground">
    Outline
  </button>
</template>
```

### Badges/Tags

```vue
<template>
  <!-- Sucesso -->
  <span class="px-2 py-1 rounded text-xs bg-jade-100 text-jade-800 border border-jade-300">
    Ativo
  </span>

  <!-- Info -->
  <span class="px-2 py-1 rounded text-xs bg-selenium-100 text-selenium-800 border border-selenium-300">
    Em Análise
  </span>

  <!-- Aviso -->
  <span class="px-2 py-1 rounded text-xs bg-sulfur-100 text-sulfur-800 border border-sulfur-300">
    Pendente
  </span>

  <!-- Erro -->
  <span class="px-2 py-1 rounded text-xs bg-ruby-100 text-ruby-800 border border-ruby-300">
    Inativo
  </span>
</template>
```

### Mensagens

```vue
<template>
  <!-- Sucesso -->
  <div class="p-4 rounded bg-jade-50 border-l-4 border-jade-500 text-jade-900">
    <strong>Sucesso!</strong> Operação realizada com sucesso.
  </div>

  <!-- Info -->
  <div class="p-4 rounded bg-selenium-50 border-l-4 border-selenium-500 text-selenium-900">
    <strong>Informação:</strong> Atualizações disponíveis.
  </div>

  <!-- Aviso -->
  <div class="p-4 rounded bg-sulfur-50 border-l-4 border-sulfur-500 text-sulfur-900">
    <strong>Atenção:</strong> Ação necessária.
  </div>

  <!-- Erro -->
  <div class="p-4 rounded bg-ruby-50 border-l-4 border-ruby-500 text-ruby-900">
    <strong>Erro:</strong> Algo deu errado.
  </div>
</template>
```

### Cards

```vue
<template>
  <div class="rounded-lg border border-border bg-card text-card-foreground shadow-sm p-6">
    <h3 class="text-lg font-semibold mb-2">Título do Card</h3>
    <p class="text-muted-foreground">Descrição do card</p>
  </div>
</template>
```

### Inputs

```vue
<template>
  <div>
    <label class="block text-sm font-medium text-foreground mb-2">
      Nome
    </label>
    <input
      type="text"
      class="w-full px-3 py-2 border border-input rounded bg-background text-foreground
             focus:outline-none focus:ring-2 focus:ring-ring focus:border-input-focus
             disabled:opacity-50 disabled:cursor-not-allowed"
    >
  </div>
</template>
```

---

## Manutenção

### Adicionando Novas Cores

1. **Adicione a variável CSS** em `base.css`:
```css
:root {
  --new-color: 200 50% 50%;
  --new-color-foreground: 0 0% 100%;
}
```

2. **Adicione ao Tailwind** em `tailwind.config.js`:
```js
colors: {
  'new-color': 'hsl(var(--new-color))',
  'new-color-foreground': 'hsl(var(--new-color-foreground))',
}
```

3. **Documente** neste arquivo o uso apropriado

### Checklist de Code Review

- [ ] Não há cores hexadecimais hardcoded
- [ ] Não há classes Tailwind de cor específica (`bg-blue-600`, etc.)
- [ ] Todas as cores usam variáveis CSS ou classes semânticas
- [ ] Estados de hover/active/disabled estão implementados
- [ ] Contraste de cores atende WCAG AA
- [ ] Estados de foco são visíveis

---

## Suporte

Para dúvidas ou sugestões sobre o sistema de cores, contate a equipe de desenvolvimento.

**Última atualização:** 2025-10-21
