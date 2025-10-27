/**
 * Composable para gerenciar renovação automática de tokens
 *
 * Funcionalidades:
 * - Verifica periodicamente se o token está expirando
 * - Renova automaticamente quando necessário
 * - Notifica o usuário quando a sessão está expirando
 * - Limpa intervalos quando o componente é desmontado
 */

import { ref, onMounted, onUnmounted, computed } from 'vue'
import { tokenService } from '@/services/token.service'
import { authService } from '@/services/auth.service'
import { useRouter } from 'vue-router'

export interface TokenRefreshOptions {
  /** Intervalo de verificação em segundos (padrão: 60s) */
  checkInterval?: number
  /** Threshold para renovação em minutos (padrão: 5min) */
  refreshThreshold?: number
  /** Ativar renovação automática (padrão: true) */
  autoRefresh?: boolean
  /** Ativar notificações (padrão: true) */
  enableNotifications?: boolean
}

export function useTokenRefresh(options: TokenRefreshOptions = {}) {
  const {
    checkInterval = 60, // 60 segundos
    refreshThreshold = 5, // 5 minutos
    autoRefresh = true,
    enableNotifications = true,
  } = options

  const router = useRouter()

  // Estado
  const isRefreshing = ref(false)
  const lastRefreshTime = ref<Date | null>(null)
  const refreshError = ref<string | null>(null)
  const sessionExpiring = ref(false)

  // Interval ID para limpar depois
  let checkIntervalId: number | null = null

  // Info do token (reativo)
  const tokenInfo = computed(() => tokenService.getTokenInfo())

  /**
   * Tenta renovar o token
   */
  async function refreshToken(): Promise<boolean> {
    if (isRefreshing.value) {
      console.log('⏳ Renovação já em andamento...')
      return false
    }

    try {
      isRefreshing.value = true
      refreshError.value = null

      console.log('🔄 Iniciando renovação de token...')

      const result = await authService.refreshToken()

      if (result) {
        lastRefreshTime.value = new Date()
        sessionExpiring.value = false
        console.log('✅ Token renovado com sucesso')

        if (enableNotifications) {
          // TODO: Adicionar notificação de sucesso se necessário
        }

        return true
      } else {
        throw new Error('Falha ao renovar token')
      }
    } catch (error: any) {
      console.error('❌ Erro ao renovar token:', error)
      refreshError.value = error.message || 'Erro ao renovar sessão'

      if (enableNotifications) {
        // TODO: Notificar erro
      }

      // Se falhou, redirecionar para login
      await handleSessionExpired()
      return false
    } finally {
      isRefreshing.value = false
    }
  }

  /**
   * Verifica se o token precisa ser renovado
   */
  function checkTokenExpiration(): void {
    if (!tokenService.hasValidToken()) {
      console.log('⚠️ Token inválido ou ausente')
      return
    }

    const info = tokenService.getTokenInfo()

    // Token já expirou
    if (info.isExpired) {
      console.log('⏰ Token expirado')
      handleSessionExpired()
      return
    }

    // Token está expirando em breve
    if (info.isExpiringSoon) {
      console.log('⚠️ Token expirando em breve:', info.formattedTime)
      sessionExpiring.value = true

      // Renovar automaticamente se habilitado
      if (autoRefresh) {
        refreshToken()
      }
    }
  }

  /**
   * Trata sessão expirada
   */
  async function handleSessionExpired(): Promise<void> {
    console.log('🚪 Sessão expirada, redirecionando para login...')

    // Limpar interval
    stopAutoRefresh()

    // Fazer logout
    await authService.logout()

    // Redirecionar para login
    router.push({ name: 'login', query: { expired: 'true' } })
  }

  /**
   * Inicia verificação automática
   */
  function startAutoRefresh(): void {
    if (checkIntervalId !== null) {
      console.warn('Auto-refresh já está ativo')
      return
    }

    console.log(`🔄 Iniciando auto-refresh (verificação a cada ${checkInterval}s)`)

    // Verificar imediatamente
    checkTokenExpiration()

    // Configurar verificação periódica
    checkIntervalId = window.setInterval(() => {
      checkTokenExpiration()
    }, checkInterval * 1000)
  }

  /**
   * Para verificação automática
   */
  function stopAutoRefresh(): void {
    if (checkIntervalId !== null) {
      console.log('🛑 Parando auto-refresh')
      window.clearInterval(checkIntervalId)
      checkIntervalId = null
    }
  }

  /**
   * Força renovação manual
   */
  async function forceRefresh(): Promise<boolean> {
    return await refreshToken()
  }

  /**
   * Obtém tempo restante formatado
   */
  function getTimeRemaining(): string {
    return tokenService.getFormattedTimeUntilExpiration()
  }

  /**
   * Verifica se está renovando
   */
  function getIsRefreshing(): boolean {
    return isRefreshing.value
  }

  /**
   * Lifecycle hooks
   */
  onMounted(() => {
    if (autoRefresh) {
      startAutoRefresh()
    }
  })

  onUnmounted(() => {
    stopAutoRefresh()
  })

  return {
    // Estado
    isRefreshing,
    lastRefreshTime,
    refreshError,
    sessionExpiring,
    tokenInfo,

    // Métodos
    refreshToken: forceRefresh,
    startAutoRefresh,
    stopAutoRefresh,
    getTimeRemaining,
    getIsRefreshing,
    checkTokenExpiration,
  }
}
