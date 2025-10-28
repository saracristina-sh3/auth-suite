import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import type { User } from '@/types/common/user.types'
import type { Autarquia } from '@/types/support/autarquia.types'

/**
 * Composable para sincronização de dados entre abas do navegador
 *
 * @description Utiliza StorageEvent para detectar mudanças no localStorage
 * em outras abas e sincronizar dados críticos como autarquia ativa,
 * logout, e contexto de suporte.
 *
 * **Eventos Sincronizados**:
 * - Logout em uma aba → logout em todas as abas
 * - Troca de autarquia → atualiza em todas as abas
 * - Entrada/saída do modo suporte → sincroniza contexto
 * - Atualização de dados do usuário → atualiza em todas
 *
 * @example
 * // No App.vue ou componente raiz
 * import { useCrossTabSync } from '@/composables/common/useCrossTabSync'
 *
 * export default {
 *   setup() {
 *     useCrossTabSync()
 *   }
 * }
 */
export function useCrossTabSync() {
  const router = useRouter()

  /**
   * Handler para eventos de mudança no localStorage
   *
   * @description Escuta mudanças no localStorage de outras abas e
   * sincroniza o estado local conforme necessário.
   */
  const handleStorageChange = (event: StorageEvent) => {
    // Event.key indica qual chave do localStorage mudou
    // Event.newValue contém o novo valor (ou null se foi removido)
    // Event.oldValue contém o valor anterior

    // 🚪 Logout detectado em outra aba
    if (event.key === 'auth_token' && event.newValue === null) {
      console.log('🔄 [CrossTab] Logout detectado em outra aba')

      // Limpar dados locais
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_data')
      localStorage.removeItem('support_context')
      localStorage.removeItem('support_mode')

      // Redirecionar para login
      router.push('/login')

      // Mostrar notificação (opcional)
      // toast.info('Sessão encerrada em outra aba')
    }

    // 🔄 Troca de autarquia detectada
    if (event.key === 'user_data' && event.newValue) {
      try {
        const newUserData = JSON.parse(event.newValue) as User
        const oldUserData = event.oldValue ? JSON.parse(event.oldValue) as User : null

        // Verificar se a autarquia ativa mudou
        const autarquiaChanged = oldUserData?.autarquia_ativa_id !== newUserData.autarquia_ativa_id

        if (autarquiaChanged) {
          console.log('🔄 [CrossTab] Autarquia ativa alterada em outra aba', {
            anterior: oldUserData?.autarquia_ativa_id,
            nova: newUserData.autarquia_ativa_id
          })

          // Recarregar a página para atualizar módulos e permissões
          window.location.reload()
        }
      } catch (error) {
        console.error('❌ [CrossTab] Erro ao processar mudança de user_data:', error)
      }
    }

    // 🛠️ Modo suporte ativado/desativado
    if (event.key === 'support_mode') {
      const supportModeActive = event.newValue === 'true'

      console.log('🔄 [CrossTab] Modo suporte alterado', {
        ativo: supportModeActive
      })

      // Recarregar para aplicar novo contexto
      window.location.reload()
    }

    // 🆕 Novo token de acesso (refresh automático)
    if (event.key === 'auth_token' && event.newValue && event.oldValue) {
      console.log('🔄 [CrossTab] Token atualizado em outra aba')

      // Não precisa fazer nada, o localStorage já tem o novo token
      // As requisições subsequentes usarão automaticamente o novo token
    }

    // 🔃 Contexto de suporte atualizado
    if (event.key === 'support_context' && event.newValue) {
      try {
        const newContext = JSON.parse(event.newValue)
        console.log('🔄 [CrossTab] Contexto de suporte atualizado', {
          autarquia: newContext.autarquia?.nome
        })

        // Recarregar para aplicar novo contexto
        window.location.reload()
      } catch (error) {
        console.error('❌ [CrossTab] Erro ao processar mudança de support_context:', error)
      }
    }
  }

  /**
   * Registra listener para StorageEvent
   */
  onMounted(() => {
    console.log('✅ [CrossTab] Sincronização entre abas ativada')
    window.addEventListener('storage', handleStorageChange)
  })

  /**
   * Remove listener quando componente é desmontado
   */
  onUnmounted(() => {
    console.log('🔌 [CrossTab] Sincronização entre abas desativada')
    window.removeEventListener('storage', handleStorageChange)
  })

  /**
   * Dispara evento customizado para notificar outras abas
   *
   * @description Útil para notificar outras abas sobre mudanças
   * que não são detectadas pelo StorageEvent (ex: mesma aba)
   */
  const broadcastChange = (key: string, value: any) => {
    // StorageEvent só dispara em outras abas, não na aba atual
    // Para notificar a aba atual também, use eventos customizados
    const event = new CustomEvent('local-storage-change', {
      detail: { key, value }
    })
    window.dispatchEvent(event)
  }

  return {
    broadcastChange
  }
}

/**
 * Hook para sincronizar logout entre abas
 *
 * @description Monitora mudanças no token de autenticação e força
 * logout quando o token é removido em outra aba.
 *
 * @example
 * import { useSyncLogout } from '@/composables/common/useCrossTabSync'
 *
 * // Em qualquer componente
 * useSyncLogout()
 */
export function useSyncLogout() {
  const router = useRouter()

  const handleLogout = (event: StorageEvent) => {
    if (event.key === 'auth_token' && event.newValue === null) {
      console.log('🔄 [Logout Sync] Redirecionando para login')
      router.push('/login')
    }
  }

  onMounted(() => {
    window.addEventListener('storage', handleLogout)
  })

  onUnmounted(() => {
    window.removeEventListener('storage', handleLogout)
  })
}

/**
 * Hook para sincronizar autarquia ativa entre abas
 *
 * @description Monitora mudanças na autarquia ativa e recarrega
 * a página quando detecta alteração em outra aba.
 *
 * @example
 * import { useSyncAutarquia } from '@/composables/common/useCrossTabSync'
 *
 * // Em componentes que dependem da autarquia ativa
 * useSyncAutarquia()
 */
export function useSyncAutarquia(onAutarquiaChange?: (autarquia: Autarquia | null) => void) {
  const handleAutarquiaChange = (event: StorageEvent) => {
    if (event.key === 'user_data' && event.newValue) {
      try {
        const newUserData = JSON.parse(event.newValue) as User
        const oldUserData = event.oldValue ? JSON.parse(event.oldValue) as User : null

        if (oldUserData?.autarquia_ativa_id !== newUserData.autarquia_ativa_id) {
          console.log('🔄 [Autarquia Sync] Autarquia alterada')

          if (onAutarquiaChange) {
            onAutarquiaChange(newUserData.autarquia_ativa || null)
          } else {
            // Por padrão, recarrega a página
            window.location.reload()
          }
        }
      } catch (error) {
        console.error('❌ [Autarquia Sync] Erro:', error)
      }
    }
  }

  onMounted(() => {
    window.addEventListener('storage', handleAutarquiaChange)
  })

  onUnmounted(() => {
    window.removeEventListener('storage', handleAutarquiaChange)
  })
}
