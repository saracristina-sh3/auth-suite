/**
 * 🎨 Ícones globais do sistema SH3
 * 
 * Aqui você centraliza todos os ícones usados no projeto.
 * Assim, se mudar de biblioteca (PrimeIcons → Lucide, Heroicons, etc.),
 * só precisa alterar aqui.
 */
export const icons = {
  // ⚙️ Ações gerais
  edit: 'pi pi-pencil',
  delete: 'pi pi-trash',
  view: 'pi pi-eye',
  add: 'pi pi-plus',
  refresh: 'pi pi-refresh',

  // 👥 Usuários
  user: 'pi pi-user',
  users: 'pi pi-users',
  login: 'pi pi-sign-in',
  logout: 'pi pi-sign-out',

  // 🏢 Autarquias
  building: 'pi pi-building',
  module: 'pi pi-sitemap',
  support: 'pi pi-shield',

  // 📦 Módulos
  active: 'pi pi-check',
  inactive: 'pi pi-times',

  // 📄 Outros
  info: 'pi pi-info-circle',
  warning: 'pi pi-exclamation-triangle'
} as const
