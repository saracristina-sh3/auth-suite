/**
 * Sistema de Cores Semânticas Vexis3
 *
 * Mapeamento semântico baseado nas cores da identidade visual Vexis3.
 * Substitui o sistema de cores shadcn por um sistema proprietário e coerente.
 */

export default {
  // ============================================================================
  // Cores de UI Base
  // ============================================================================

  /** Cor padrão de bordas */
  border: "hsl(var(--border))",

  /** Cor de fundo de inputs */
  input: "hsl(var(--input))",

  /** Cor do anel de foco (focus ring) */
  ring: "hsl(var(--ring))",

  /** Cor de fundo principal da aplicação */
  background: "hsl(var(--background))",

  /** Cor de texto principal (foreground) */
  foreground: "hsl(var(--foreground))",

  // ============================================================================
  // Estados e Variações
  // ============================================================================

  /** Estilo secundário (botões, elementos de apoio) */
  secondary: {
    DEFAULT: "hsl(var(--secondary))",
    foreground: "hsl(var(--secondary-foreground))",
  },

  /** Estilo destrutivo (ações de deletar, erros críticos) */
  destructive: {
    DEFAULT: "hsl(var(--destructive))",
    foreground: "hsl(var(--destructive-foreground))",
  },

  /** Estilo muted (textos secundários, elementos desabilitados) */
  muted: {
    DEFAULT: "hsl(var(--muted))",
    foreground: "hsl(var(--muted-foreground))",
  },

  /** Estilo accent (hover, elementos destacados) */
  accent: {
    DEFAULT: "hsl(var(--accent))",
    foreground: "hsl(var(--accent-foreground))",
  },

  // ============================================================================
  // Componentes
  // ============================================================================

  /** Estilo de popovers e tooltips */
  popover: {
    DEFAULT: "hsl(var(--popover))",
    foreground: "hsl(var(--popover-foreground))",
  },

  /** Estilo de cards e painéis */
  card: {
    DEFAULT: "hsl(var(--card))",
    foreground: "hsl(var(--card-foreground))",
  },

  /** Estilo do sidebar/menu lateral */
  sidebar: {
    background: "hsl(var(--sidebar-background))",
    foreground: "hsl(var(--sidebar-foreground))",
    primary: "hsl(var(--sidebar-primary))",
    "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
    accent: "hsl(var(--sidebar-accent))",
    "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
    border: "hsl(var(--sidebar-border))",
    ring: "hsl(var(--sidebar-ring))",
  },
};
