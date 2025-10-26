// src/composables/useModulos.ts
import { ref, onMounted, computed } from 'vue'
import { moduloService } from '@/services/modulos.service'
import { authService } from '@/services/auth.service'
import { supportService } from '@/services/support.service'
import type { ModuloWithUI } from '@/types/support/modulos.types'
import { iconMap, routeMap } from '@/constants/modulos.constants'
import { getErrorMessage } from '@/utils/error.utils'
import { useCache } from '@/composables/common/useCache'

const modulos = ref<ModuloWithUI[]>([])
const loadingModulos = ref(true)
const error = ref<string | null>(null)

// Cache com TTL de 5 minutos
const modulosCache = useCache<ModuloWithUI[]>({
  key: 'modulos',
  ttl: 5 * 60 * 1000 // 5 minutos
})

export function useModulos() {
  const loadModulos = async (forceRefresh: boolean = false) => {
    try {
      loadingModulos.value = true
      error.value = null

      // 🔍 Verificar se está em modo suporte PRIMEIRO
      const supportContext = supportService.getSupportContext()

      if (supportContext && supportContext.support_mode) {
        // 🛡️ MODO SUPORTE ATIVO: Usar módulos do contexto de suporte (sem cache)
        console.log('🛡️ Modo suporte ativo - Carregando módulos do contexto:', supportContext.autarquia.nome)

        const data = supportContext.modulos || []

        // Mapeia os módulos com ícones e rotas
        modulos.value = data
          .filter(modulo => modulo.ativo !== false) // Apenas módulos ativos
          .map(modulo => ({
            ...modulo,
            icon: iconMap[modulo.icone || ''] || iconMap[modulo.nome] || 'pi pi-box',
            route: routeMap[modulo.nome] || '/',
            key: modulo.nome.toLowerCase().replace(/\s+/g, '-'),
            title: modulo.nome,
            description: modulo.descricao || `Módulo ${modulo.nome}`
          }))

        console.log('✅ Módulos do modo suporte carregados:', modulos.value.length, 'módulos')
        return
      }

      // 👤 MODO NORMAL: Buscar módulos pela autarquia do usuário
      const user = authService.getUserFromStorage()

      if (!user) {
        console.error('❌ Usuário não autenticado')
        error.value = 'Usuário não autenticado'
        modulos.value = []
        return
      }

      console.log('📋 User data:', {
        id: user.id,
        email: user.email,
        autarquia_ativa_id: user.autarquia_ativa_id,
        autarquia_ativa: user.autarquia_ativa
      })

      // Verificar autarquia ativa
      if (!user.autarquia_ativa_id) {
        console.error('❌ Usuário não possui autarquia_ativa_id definida')
        error.value = 'Nenhuma autarquia ativa selecionada. Por favor, selecione uma autarquia.'
        modulos.value = []
        return
      }

      console.log('👤 Carregando módulos da autarquia:', user.autarquia_ativa?.nome || user.autarquia_ativa_id)

      // Chave de cache específica por autarquia
      const cacheKey = `modulos-autarquia-${user.autarquia_ativa_id}`

      // Buscar com cache
      const data = await modulosCache.fetch(
        async () => {
          // Buscar módulos da API
          const response = await moduloService.list(user.autarquia_ativa_id!)

          // Mapear com ícones e rotas
          return response.data
            .filter(modulo => modulo.ativo)
            .map(modulo => ({
              ...modulo,
              icon: iconMap[modulo.icone || ''] || iconMap[modulo.nome] || 'pi pi-box',
              route: routeMap[modulo.nome] || '/',
              key: modulo.nome.toLowerCase().replace(/\s+/g, '-'),
              title: modulo.nome,
              description: modulo.descricao || `Módulo ${modulo.nome}`
            }))
        },
        cacheKey,
        forceRefresh
      )

      modulos.value = data
      console.log('✅ Módulos carregados para autarquia:', user.autarquia_ativa?.nome, modulos.value.length, 'módulos')
    } catch (err: unknown) {
      error.value = getErrorMessage(err)
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
    console.log('🔄 Invalidando cache e recarregando módulos...')
    modulosCache.invalidate()
    await loadModulos(true)
  }

  /**
   * Invalida o cache sem recarregar
   */
  const invalidateCache = () => {
    console.log('🗑️ Invalidando cache de módulos...')
    modulosCache.invalidate()
  }

  onMounted(() => {
    loadModulos()
  })

  // Computed para informações do cache
  const cacheInfo = computed(() => ({
    hasCache: modulosCache.hasValidCache.value,
    timeToExpire: modulosCache.timeToExpire.value,
    timeToExpireMinutes: Math.ceil(modulosCache.timeToExpire.value / 60000)
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