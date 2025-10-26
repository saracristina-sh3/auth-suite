// src/composables/common/useModulosSupport.ts
import { ref, onMounted } from 'vue'
import { moduloService } from '@/services/modulos.service'
import { iconMap } from '@/constants/modulos.constants'
import type { ModuloWithUI } from '@/types/support/modulos.types'


const modulos = ref<ModuloWithUI[]>([])
const loadingModulos = ref(true)
const error = ref<string | null>(null)

export function useModulosSupport() {
  const loadModulos = async () => {
    try {
      loadingModulos.value = true
      error.value = null

      console.log('📦 Carregando TODOS os módulos do sistema (administração)')

      // Buscar TODOS os módulos sem filtrar por autarquia
      const data = await moduloService.getModulos()

      // Mapeia os módulos com ícones (sem rotas, pois não é para navegação)
      modulos.value = data.map(modulo => ({
        ...modulo,
        icon: iconMap[modulo.icone || ''] || iconMap[modulo.nome] || 'pi pi-box'
      }))

      console.log('✅ Todos os módulos carregados:', modulos.value.length, 'módulos', modulos.value)
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