// src/composables/common/useModulosSupport.ts
import { ref, onMounted, computed } from 'vue'
import { moduloService } from '@/services/modulos.service'
import { iconMap } from '@/constants/modulos.constants'
import type { ModuloWithUI } from '@/types/support/modulos.types'
import { useCache } from '@/composables/common/useCache'

const modulos = ref<ModuloWithUI[]>([])
const loadingModulos = ref(true)
const error = ref<string | null>(null)

// Cache com TTL de 5 minutos para módulos de suporte
const supportModulosCache = useCache<ModuloWithUI[]>({
  key: 'modulos-support',
  ttl: 5 * 60 * 1000 // 5 minutos
})

export function useModulosSupport() {
  const loadModulos = async (forceRefresh: boolean = false) => {
    try {
      loadingModulos.value = true
      error.value = null

      console.log('📦 Carregando TODOS os módulos do sistema (administração)')

      // Buscar com cache
      const data = await supportModulosCache.fetch(
        async () => {
          // Buscar TODOS os módulos sem filtrar por autarquia
          const rawData = await moduloService.getModulos()

          // Mapeia os módulos com ícones (sem rotas, pois não é para navegação)
          return rawData.map(modulo => ({
            ...modulo,
            icon: iconMap[modulo.icone || ''] || iconMap[modulo.nome] || 'pi pi-box'
          }))
        },
        'modulos-support',
        forceRefresh
      )

      modulos.value = data
      console.log('✅ Todos os módulos carregados:', modulos.value.length, 'módulos')
    } catch (err: unknown) {
      let errorMessage = 'Erro ao carregar módulos'
      if (typeof err === 'object' && err !== null) {
        const maybeMessage = (err as any)?.response?.data?.message
        if (typeof maybeMessage === 'string' && maybeMessage.length) {
          errorMessage = maybeMessage
        }
      }
      error.value = errorMessage
      console.error('❌ Erro ao carregar módulos:', err)
      modulos.value = []
    } finally {
      loadingModulos.value = false
    }
  }

  /**
   * Invalida o cache e recarrega os módulos
   */
  const refresh = async () => {
    console.log('🔄 Invalidando cache de módulos de suporte e recarregando...')
    supportModulosCache.invalidate()
    await loadModulos(true)
  }

  /**
   * Invalida o cache sem recarregar
   */
  const invalidateCache = () => {
    console.log('🗑️ Invalidando cache de módulos de suporte...')
    supportModulosCache.invalidate()
  }

  onMounted(() => {
    loadModulos()
  })

  // Computed para informações do cache
  const cacheInfo = computed(() => ({
    hasCache: supportModulosCache.hasValidCache.value,
    timeToExpire: supportModulosCache.timeToExpire.value,
    timeToExpireMinutes: Math.ceil(supportModulosCache.timeToExpire.value / 60000)
  }))

  return {
    modulos,
    loadingModulos,
    error,
    reload: loadModulos,
    refresh,
    invalidateCache,
    cacheInfo
  }
}