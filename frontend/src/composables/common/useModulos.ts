// src/composables/useModulos.ts
import { ref, onMounted } from 'vue'
import { moduloService } from '@/services/modulos.service'
import { authService } from '@/services/auth.service'
import { supportService } from '@/services/support.service'
import type { ModuloWithUI } from '@/types/modulos.types'
import { iconMap, routeMap } from '@/constants/modulos.constants'

const modulos = ref<ModuloWithUI[]>([])
const loadingModulos = ref(true)
const error = ref<string | null>(null)

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

      // Carregar módulos baseado na autarquia do usuário
      let data
      if (user.autarquia_ativa_id) {
        console.log('👤 Carregando módulos da autarquia:', user.autarquia_ativa?.nome || user.autarquia_ativa_id)
        data = await moduloService.list(user.autarquia_ativa_id)
      } else {
        console.error('❌ Usuário não possui autarquia_ativa_id definida')
        error.value = 'Nenhuma autarquia ativa selecionada. Por favor, selecione uma autarquia.'
        modulos.value = []
        return
      }

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

      console.log('✅ Módulos carregados para autarquia:', user.autarquia?.nome, modulos.value)
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