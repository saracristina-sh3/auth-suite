import { ref, computed, type Ref } from 'vue'
import {
  type AutarquiaWithPivot,
  type UserAutarquiaPivot,
  type SyncAutarquiasPayload
} from '@/types/common/use-autarquia-pivot.types'
import { userService } from '@/services/user.service'
import { handleApiError } from '@/utils/error-handler'
import { useCache } from '@/composables/common/useCache'

/**
 * Composable para gerenciar autarquias de um usuário
 *
 * @param userId - ID do usuário (pode ser ref ou número)
 * @returns Objeto com estado e métodos para gerenciar autarquias
 */
export function useUserAutarquias(userId: Ref<number> | number) {
  const userIdRef = ref(typeof userId === 'number' ? userId : userId)

  const autarquias = ref<AutarquiaWithPivot[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const userAutarquiasCache = useCache<AutarquiaWithPivot[]>({
    key: `user-autarquias-${userIdRef.value}`,
    ttl: 3 * 60 * 1000 
  })

  const autarquiasAtivas = computed(() =>
    autarquias.value.filter(a => a.pivot.ativo && a.ativo)
  )

  const autarquiasAdmin = computed(() =>
    autarquias.value.filter(a => a.pivot.is_admin)
  )

  const autarquiaDefault = computed(() =>
    autarquias.value.find(a => a.pivot.is_default) || null
  )

  /**
   * Carrega as autarquias do usuário
   *
   * @param forceRefresh - Se true, força atualização ignorando cache
   */
  async function loadAutarquias(forceRefresh: boolean = false): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const cacheKey = `user-autarquias-${userIdRef.value}`

      const data = await userAutarquiasCache.fetch(
        async () => {
          return await userService.getUserAutarquias(userIdRef.value)
        },
        cacheKey,
        forceRefresh
      )

      autarquias.value = data
    } catch (err: unknown) {
      const { message } = handleApiError(err)
      error.value = message
      console.error('Erro ao carregar autarquias:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Invalida o cache e recarrega as autarquias
   */
  const refreshAutarquias = async () => {
    console.log('🔄 Invalidando cache de autarquias do usuário e recarregando...')
    userAutarquiasCache.invalidate()
    await loadAutarquias(true)
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
      // Invalida cache e recarrega
      userAutarquiasCache.invalidate()
      await loadAutarquias(true)
    } catch (err: unknown) {
      const { message } = handleApiError(err)
      error.value = message
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

      userAutarquiasCache.invalidate()
      await loadAutarquias(true)
    } catch (err: unknown) {
      const { message } = handleApiError(err)
      error.value = message
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

      userAutarquiasCache.invalidate()
      await loadAutarquias(true)
    } catch (err: unknown) {
      const { message } = handleApiError(err)
      error.value = message
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
    } catch (err: unknown) {
      const { message } = handleApiError(err)
      error.value = message
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
    if (!currentPivot) throw new Error('Usuário não está vinculado a esta autarquia')

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
    if (!currentPivot) throw new Error('Usuário não está vinculado a esta autarquia')

    await detachAutarquia([autarquiaId])
    await attachAutarquia([autarquiaId], {
      role: 'user',
      is_admin: false,
      ativo: currentPivot.ativo
    })
  }

  const cacheInfo = computed(() => ({
    hasCache: userAutarquiasCache.hasValidCache.value,
    timeToExpire: userAutarquiasCache.timeToExpire.value,
    timeToExpireMinutes: Math.ceil(userAutarquiasCache.timeToExpire.value / 60000)
  }))

  return {
    autarquias,
    loading,
    error,
    autarquiasAtivas,
    autarquiasAdmin,
    autarquiaDefault,
    loadAutarquias,
    refreshAutarquias,
    attachAutarquia,
    detachAutarquia,
    syncAutarquias,
    updateActiveAutarquia,
    hasAutarquia,
    isAdminOf,
    getPivotData,
    promoteToAdmin,
    demoteFromAdmin,
    cacheInfo
  }
}
