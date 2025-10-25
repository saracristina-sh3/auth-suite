// src/composables/useSupportTabs.ts
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { UseSupportTabsOptions, TabConfig } from '@/types/common/tabs.types'

/**
 * Composable para gerenciar tabs do painel de suporte
 *
 * @param options - Configurações dos campos de formulário e callbacks
 * @returns Objeto com estado e métodos das tabs
 *
 * @example
 * const { tabs, currentTabName, activeTabLabel, showNewButton, currentFields } = useSupportTabs({
 *   userFields: userConfig.fields,
 *   autarquiaFields: autarquiaConfig.fields,
 *   moduloFields: moduloConfig.fields,
 *   onTabChange: async (tabName) => {
 *     if (tabName === 'usuarios') await loadUsers()
 *   }
 * })
 */
export function useSupportTabs(options: UseSupportTabsOptions) {
  const route = useRoute()

  // Configuração das tabs disponíveis
  const tabs: TabConfig[] = [
    {
      label: 'Dashboard',
      path: '/suporteSH3/dashboard',
      singularLabel: 'Dashboard'
    },
    {
      label: 'Usuários',
      path: '/suporteSH3/usuarios',
      allowsNew: true,
      singularLabel: 'Usuário'
    },
    {
      label: 'Autarquias',
      path: '/suporteSH3/autarquias',
      allowsNew: true,
      singularLabel: 'Autarquia'
    },
    {
      label: 'Módulos',
      path: '/suporteSH3/modulos',
      allowsNew: false,
      singularLabel: 'Módulo'
    },
    {
      label: 'Liberações',
      path: '/suporteSH3/liberacoes',
      singularLabel: 'Liberação'
    },
    {
      label: 'Modo Suporte',
      path: '/suporteSH3/modo-suporte',
      singularLabel: 'Suporte'
    }
  ]

  /**
   * Computed: Nome da tab atual baseado na URL
   */
  const currentTabName = computed(() => {
    return route.path.split('/').pop() || 'dashboard'
  })

  /**
   * Computed: Configuração da tab atual
   */
  const currentTab = computed(() => {
    return tabs.find(tab => tab.path.endsWith(currentTabName.value))
  })

  /**
   * Computed: Label singular da tab atual (para formulários)
   */
  const activeTabLabel = computed(() => {
    return currentTab.value?.singularLabel || 'Item'
  })

  /**
   * Computed: Verifica se a tab atual permite criar novo item
   */
  const showNewButton = computed(() => {
    return currentTab.value?.allowsNew || false
  })

  /**
   * Computed: Índice numérico da tab atual (para compatibilidade)
   */
  const activeTabIndex = computed(() => {
    const indexMap: Record<string, number> = {
      'dashboard': 0,
      'usuarios': 1,
      'autarquias': 2,
      'modulos': 3,
      'liberacoes': 4,
      'modo-suporte': 5
    }
    return indexMap[currentTabName.value] || 0
  })

  /**
   * Computed: Campos do formulário baseado na tab atual
   */
  const currentFields = computed(() => {
    switch (currentTabName.value) {
      case 'usuarios':
        return options.userFields.value
      case 'autarquias':
        return options.autarquiaFields
      case 'modulos':
        return options.moduloFields
      default:
        return []
    }
  })

  /**
   * Watch: Executa callback quando a tab muda
   */
  if (options.onTabChange) {
    watch(
      () => route.path,
      async (newPath) => {
        const tabName = newPath.split('/').pop()
        if (tabName && options.onTabChange) {
          await options.onTabChange(tabName)
        }
      },
      { immediate: true }
    )
  }

  /**
   * Verifica se uma tab específica está ativa
   */
  function isTabActive(tabName: string): boolean {
    return currentTabName.value === tabName
  }

  /**
   * Retorna a configuração de uma tab específica
   */
  function getTabConfig(tabName: string): TabConfig | undefined {
    return tabs.find(tab => tab.path.endsWith(tabName))
  }

  return {
    // Estado
    tabs,
    currentTabName,
    currentTab,
    activeTabLabel,
    showNewButton,
    activeTabIndex,
    currentFields,

    // Métodos
    isTabActive,
    getTabConfig
  }
}
