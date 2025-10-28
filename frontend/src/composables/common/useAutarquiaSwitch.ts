import { ref } from 'vue'
import { sessionService } from '@/services/session.service'
import { authService } from '@/services/auth.service'
import { handleApiError } from '@/utils/error-handler'
import { setItem, STORAGE_KEYS } from '@/utils/storage'
import type { Autarquia } from '@/types/support/autarquia.types'

/**
 * Composable para gerenciar troca de autarquia ativa
 *
 * @description Fornece funcionalidade para trocar a autarquia ativa do usuário
 * e sincronizar essa mudança entre todas as abas abertas.
 *
 * **Fluxo de troca**:
 * 1. Atualiza autarquia ativa na sessão Laravel (backend)
 * 2. Atualiza dados do usuário no localStorage
 * 3. Dispara StorageEvent que notifica outras abas
 * 4. Outras abas recarregam automaticamente
 *
 * @example
 * import { useAutarquiaSwitch } from '@/composables/common/useAutarquiaSwitch'
 *
 * const { switchAutarquia, loading, error } = useAutarquiaSwitch()
 *
 * // Trocar para autarquia ID 5
 * await switchAutarquia(5)
 */
export function useAutarquiaSwitch() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Troca a autarquia ativa do usuário
   *
   * @param {number} autarquiaId - ID da nova autarquia ativa
   * @param {Autarquia} [autarquia] - Objeto da autarquia (opcional, evita busca extra)
   *
   * @returns {Promise<void>}
   *
   * @throws {Error} Se o usuário não tiver acesso à autarquia ou requisição falhar
   *
   * @example
   * // Trocar autarquia
   * await switchAutarquia(5)
   *
   * // Trocar autarquia com dados
   * await switchAutarquia(5, { id: 5, nome: 'Prefeitura A', ... })
   */
  async function switchAutarquia(
    autarquiaId: number,
    autarquia?: Autarquia
  ): Promise<void> {
    loading.value = true
    error.value = null

    try {
      console.log('🔄 [Autarquia Switch] Iniciando troca de autarquia', {
        autarquia_id: autarquiaId
      })

      // 1. Atualizar autarquia ativa na sessão Laravel (backend)
      const sessionResponse = await sessionService.setActiveAutarquia(autarquiaId)

      console.log('✅ [Autarquia Switch] Sessão atualizada no backend', {
        autarquia_ativa_id: sessionResponse.data.autarquia_ativa_id,
        autarquia_nome: sessionResponse.data.autarquia_ativa?.nome
      })

      // 2. Atualizar dados do usuário no localStorage
      const user = authService.getUserFromStorage()

      if (user) {
        const updatedUser = {
          ...user,
          autarquia_ativa_id: autarquiaId,
          autarquia_ativa: autarquia || sessionResponse.data.autarquia_ativa
        }

        // ⚠️ IMPORTANTE: setItem dispara StorageEvent que notifica outras abas
        setItem(STORAGE_KEYS.USER, updatedUser)

        console.log('✅ [Autarquia Switch] localStorage atualizado', {
          autarquia_ativa_id: updatedUser.autarquia_ativa_id,
          autarquia_nome: updatedUser.autarquia_ativa?.nome
        })
      }

      console.log('✅ [Autarquia Switch] Troca concluída com sucesso')

      // 3. Recarregar a página para aplicar novo contexto
      // (módulos, permissões, etc. dependem da autarquia ativa)
      window.location.reload()

    } catch (err: unknown) {
      const { message } = handleApiError(err)
      error.value = message

      console.error('❌ [Autarquia Switch] Erro ao trocar autarquia:', {
        autarquia_id: autarquiaId,
        error: message
      })

      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Limpa a autarquia ativa
   *
   * @description Remove a autarquia ativa da sessão Laravel e do localStorage.
   * Útil quando o usuário não tem autarquia definida ou quer resetar.
   *
   * @returns {Promise<void>}
   *
   * @example
   * await clearAutarquia()
   */
  async function clearAutarquia(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      console.log('🧹 [Autarquia Switch] Limpando autarquia ativa')

      // 1. Limpar da sessão Laravel
      await sessionService.clearActiveAutarquia()

      // 2. Atualizar localStorage
      const user = authService.getUserFromStorage()

      if (user) {
        const updatedUser = {
          ...user,
          autarquia_ativa_id: null,
          autarquia_ativa: null
        }

        setItem(STORAGE_KEYS.USER, updatedUser)
      }

      console.log('✅ [Autarquia Switch] Autarquia limpa com sucesso')

    } catch (err: unknown) {
      const { message } = handleApiError(err)
      error.value = message

      console.error('❌ [Autarquia Switch] Erro ao limpar autarquia:', message)

      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    switchAutarquia,
    clearAutarquia,
    loading,
    error
  }
}
