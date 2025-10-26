import { ref, computed } from 'vue'

/**
 * Tipo para o estado dos dados
 */
export type DataState = 'idle' | 'loading' | 'success' | 'error' | 'empty'

/**
 * Interface para configuração de mensagens de empty state por entidade
 */
export interface EmptyStateConfig {
  icon: string
  title: string
  description: string
}

/**
 * Configurações padrão de empty state por tipo de entidade
 */
export const EMPTY_STATE_CONFIGS: Record<string, EmptyStateConfig> = {
  users: {
    icon: 'pi pi-users',
    title: 'Nenhum usuário cadastrado',
    description: 'Comece adicionando novos usuários ao sistema clicando no botão "Novo".'
  },
  autarquias: {
    icon: 'pi pi-building',
    title: 'Nenhuma autarquia cadastrada',
    description: 'Adicione autarquias para organizar e gerenciar usuários e módulos.'
  },
  modulos: {
    icon: 'pi pi-box',
    title: 'Nenhum módulo disponível',
    description: 'Não há módulos cadastrados no sistema no momento.'
  },
  default: {
    icon: 'pi pi-inbox',
    title: 'Nenhum registro encontrado',
    description: 'Não há dados para exibir no momento.'
  }
}

/**
 * Composable para gerenciar estados de carregamento de dados
 *
 * @param entityType - Tipo da entidade para usar configuração personalizada de empty state
 * @returns Objeto com estado e funções de controle
 */
export function useDataState(entityType?: keyof typeof EMPTY_STATE_CONFIGS) {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const data = ref<any[]>([])

  // Computed para determinar o estado atual
  const state = computed<DataState>(() => {
    if (loading.value) return 'loading'
    if (error.value) return 'error'
    if (data.value.length === 0) return 'empty'
    return 'success'
  })

  // Computed para empty state config
  const emptyStateConfig = computed(() => {
    if (entityType && EMPTY_STATE_CONFIGS[entityType]) {
      return EMPTY_STATE_CONFIGS[entityType]
    }
    return EMPTY_STATE_CONFIGS.default
  })

  /**
   * Inicia o estado de loading
   */
  function startLoading() {
    loading.value = true
    error.value = null
  }

  /**
   * Define os dados com sucesso
   */
  function setData<T = any>(newData: T[]) {
    data.value = newData
    loading.value = false
    error.value = null
  }

  /**
   * Define um erro
   */
  function setError(errorMessage: string) {
    error.value = errorMessage
    loading.value = false
    data.value = []
  }

  /**
   * Reseta o estado
   */
  function reset() {
    loading.value = false
    error.value = null
    data.value = []
  }

  /**
   * Executa uma função async e gerencia os estados automaticamente
   */
  async function execute<T = any>(
    fn: () => Promise<T[]>,
    onError?: (err: unknown) => string
  ): Promise<void> {
    try {
      startLoading()
      const result = await fn()
      setData(result)
    } catch (err) {
      const errorMessage = onError
        ? onError(err)
        : 'Erro ao carregar dados. Tente novamente.'
      setError(errorMessage)
    }
  }

  return {
    // Estado
    loading,
    error,
    data,
    state,
    emptyStateConfig,

    // Ações
    startLoading,
    setData,
    setError,
    reset,
    execute
  }
}
