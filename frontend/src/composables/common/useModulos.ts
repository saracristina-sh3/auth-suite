// src/composables/useModulos.ts
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { moduloService } from '@/services/modulos.service'
import { authService } from '@/services/auth.service'
import { supportService } from '@/services/support.service'
import type { ModuloWithUI } from '@/types/modulos.types'
import { iconMap, routeMap } from '@/constants/modulos.constants'
import { useAutarquiaStore } from '@/stores/autarquia.store'

const modulos = ref<ModuloWithUI[]>([])
const loadingModulos = ref(true)
const error = ref<string | null>(null)
const autarquiaStore = useAutarquiaStore()
const { autarquiaId, autarquia } = storeToRefs(autarquiaStore)

export function useModulos() {
  const loadModulos = async () => {
    try {
      loadingModulos.value = true
      error.value = null

      // 🔍 Verificar se está em modo suporte PRIMEIRO
      const supportContext = supportService.getSupportContext()

      if (supportContext && supportContext.support_mode) {
        // 🛡️ MODO SUPORTE ATIVO: Usar módulos do contexto de suporte
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
      if (!authService.isAuthenticated()) {
        error.value = 'Usuário não autenticado'
        modulos.value = []
        return
      }

      let autarquiaIdValue = autarquiaId.value

      if (!autarquiaIdValue) {
        try {
          // Buscamos a autarquia diretamente do backend para garantir alinhamento com a sessão atual
          await autarquiaStore.fetchAutarquia()
          autarquiaIdValue = autarquiaId.value
        } catch (storeError) {
          console.error('❌ Erro ao sincronizar contexto da autarquia antes de carregar módulos:', storeError)
        }
      }

        if (!autarquiaIdValue) {
          error.value = 'Não foi possível determinar a autarquia ativa.'
          modulos.value = []
          return
        }

        let data
        console.log('👤 Carregando módulos da autarquia ativa em sessão:', autarquiaIdValue)
        data = await moduloService.list(autarquiaIdValue)

      // Mapeia os módulos com ícones e rotas
      modulos.value = data
        .filter(modulo => modulo.ativo)
        .map(modulo => ({
          ...modulo,
          icon: iconMap[modulo.icone || ''] || iconMap[modulo.nome] || 'pi pi-box',
          route: routeMap[modulo.nome] || '/',
          key: modulo.nome.toLowerCase().replace(/\s+/g, '-'),
          title: modulo.nome,
          description: modulo.descricao || `Módulo ${modulo.nome}`
        }))

        console.log('✅ Módulos carregados para autarquia:', autarquia.value?.nome, modulos.value)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar módulos'
      console.error('❌ Erro ao carregar módulos:', err)
      modulos.value = []
    } finally {
      loadingModulos.value = false
    }
  }

  onMounted(() => {
    loadModulos()
  })

  return {
    modulos,
    loadingModulos,
    error,
    reload: loadModulos
  }
}