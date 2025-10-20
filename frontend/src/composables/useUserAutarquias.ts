import { ref, computed, type Ref } from 'vue'
import {
  userService,
  type AutarquiaWithPivot,
  type UserAutarquiaPivot,
  type SyncAutarquiasPayload
} from '@/services/user.service'

/**
 * Composable para gerenciar autarquias de um usuário
 *
 * @param userId - ID do usuário (pode ser ref ou número)
 * @returns Objeto com estado e métodos para gerenciar autarquias
 *
 * @example
 * const { autarquias, loading, error, loadAutarquias, attachAutarquia } = useUserAutarquias(userId)
 */
export function useUserAutarquias(userId: Ref<number> | number) {
  const userIdRef = ref(typeof userId === 'number' ? userId : userId)

  const autarquias = ref<AutarquiaWithPivot[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Computed: Retorna apenas autarquias ativas
   */
  const autarquiasAtivas = computed(() =>
    autarquias.value.filter(a => a.pivot.ativo && a.ativo)
  )

  /**
   * Computed: Retorna autarquias onde o usuário é admin
   */
  const autarquiasAdmin = computed(() =>
    autarquias.value.filter(a => a.pivot.is_admin)
  )

  /**
   * Computed: Retorna a autarquia padrão (is_default = true)
   */
  const autarquiaDefault = computed(() =>
    autarquias.value.find(a => a.pivot.is_default) || null
  )

  /**
   * Carrega as autarquias do usuário
   */
  async function loadAutarquias(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      autarquias.value = await userService.getUserAutarquias(userIdRef.value)
    } catch (err: any) {
      error.value = err.message || 'Erro ao carregar autarquias'
      console.error('Erro ao carregar autarquias:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Anexa uma ou mais autarquias ao usuário
   */
  async function attachAutarquia(
    autarquiaIds: number[],
    pivotData?: Partial<UserAutarquiaPivot>
  ): Promise<void> {
    loading.value = true
    error.value = null

    try {
      await userService.attachAutarquias(userIdRef.value, autarquiaIds, pivotData)
      await loadAutarquias() // Recarrega a lista
    } catch (err: any) {
      error.value = err.message || 'Erro ao anexar autarquias'
      console.error('Erro ao anexar autarquias:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Desanexa uma ou mais autarquias do usuário
   */
  async function detachAutarquia(autarquiaIds: number[]): Promise<void> {
    loading.value = true
    error.value = null

    try {
      await userService.detachAutarquias(userIdRef.value, autarquiaIds)
      await loadAutarquias() // Recarrega a lista
    } catch (err: any) {
      error.value = err.message || 'Erro ao desanexar autarquias'
      console.error('Erro ao desanexar autarquias:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Sincroniza as autarquias do usuário
   */
  async function syncAutarquias(autarquiasToSync: SyncAutarquiasPayload[]): Promise<void> {
    loading.value = true
    error.value = null

    try {
      await userService.syncAutarquias(userIdRef.value, autarquiasToSync)
      await loadAutarquias() // Recarrega a lista
    } catch (err: any) {
      error.value = err.message || 'Erro ao sincronizar autarquias'
      console.error('Erro ao sincronizar autarquias:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Atualiza a autarquia ativa do usuário
   */
  async function updateActiveAutarquia(autarquiaId: number): Promise<void> {
    loading.value = true
    error.value = null

    try {
      await userService.updateActiveAutarquia(userIdRef.value, autarquiaId)
    } catch (err: any) {
      error.value = err.message || 'Erro ao atualizar autarquia ativa'
      console.error('Erro ao atualizar autarquia ativa:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Verifica se o usuário está vinculado a uma autarquia específica
   */
  function hasAutarquia(autarquiaId: number): boolean {
    return autarquias.value.some(a => a.id === autarquiaId)
  }

  /**
   * Verifica se o usuário é admin de uma autarquia específica
   */
  function isAdminOf(autarquiaId: number): boolean {
    const autarquia = autarquias.value.find(a => a.id === autarquiaId)
    return autarquia?.pivot.is_admin || false
  }

  /**
   * Obtém os dados da pivot de uma autarquia específica
   */
  function getPivotData(autarquiaId: number): UserAutarquiaPivot | null {
    const autarquia = autarquias.value.find(a => a.id === autarquiaId)
    return autarquia?.pivot || null
  }

  /**
   * Promove o usuário a admin em uma autarquia específica
   */
  async function promoteToAdmin(autarquiaId: number): Promise<void> {
    const currentPivot = getPivotData(autarquiaId)
    if (!currentPivot) {
      throw new Error('Usuário não está vinculado a esta autarquia')
    }

    // Desanexa e reanexa com novos dados
    await detachAutarquia([autarquiaId])
    await attachAutarquia([autarquiaId], {
      role: 'admin',
      is_admin: true,
      ativo: currentPivot.ativo
    })
  }

  /**
   * Rebaixa o usuário de admin para user em uma autarquia específica
   */
  async function demoteFromAdmin(autarquiaId: number): Promise<void> {
    const currentPivot = getPivotData(autarquiaId)
    if (!currentPivot) {
      throw new Error('Usuário não está vinculado a esta autarquia')
    }

    // Desanexa e reanexa com novos dados
    await detachAutarquia([autarquiaId])
    await attachAutarquia([autarquiaId], {
      role: 'user',
      is_admin: false,
      ativo: currentPivot.ativo
    })
  }

  return {
    // Estado
    autarquias,
    loading,
    error,

    // Computed
    autarquiasAtivas,
    autarquiasAdmin,
    autarquiaDefault,

    // Métodos principais
    loadAutarquias,
    attachAutarquia,
    detachAutarquia,
    syncAutarquias,
    updateActiveAutarquia,

    // Métodos auxiliares
    hasAutarquia,
    isAdminOf,
    getPivotData,
    promoteToAdmin,
    demoteFromAdmin
  }
}
