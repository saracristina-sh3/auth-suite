/**
 * Serviço centralizado para gerenciamento de tokens
 *
 * Responsável por:
 * - Armazenar e recuperar tokens
 * - Verificar expiração
 * - Limpar tokens
 * - Gerenciar refresh tokens
 */

import { getItem, setItem, removeItem, STORAGE_KEYS } from '@/utils/storage'

export interface TokenData {
  token: string
  refreshToken: string
  expiresIn: number // em segundos
}

class TokenService {
  /**
   * Salva os tokens no localStorage
   */
  saveTokens(token: string, refreshToken: string, expiresIn: number): void {
    setItem(STORAGE_KEYS.AUTH_TOKEN, token)
    setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)

    // Calcular timestamp de expiração
    const expiresAt = Date.now() + expiresIn * 1000
    setItem(STORAGE_KEYS.TOKEN_EXPIRES_AT, expiresAt)

    console.log('✅ Tokens salvos com sucesso')
    console.log(`⏰ Token expira em: ${expiresIn}s (${new Date(expiresAt).toLocaleString()})`)
  }

  /**
   * Obtém o access token atual
   */
  getAccessToken(): string | null {
    const token = getItem<string>(STORAGE_KEYS.AUTH_TOKEN, '')
    return token || null
  }

  /**
   * Obtém o refresh token atual
   */
  getRefreshToken(): string | null {
    const token = getItem<string>(STORAGE_KEYS.REFRESH_TOKEN, '')
    return token || null
  }

  /**
   * Obtém o timestamp de expiração do token
   */
  getTokenExpiresAt(): number {
    return getItem<number>(STORAGE_KEYS.TOKEN_EXPIRES_AT, 0)
  }

  /**
   * Verifica se existe um token válido
   */
  hasValidToken(): boolean {
    const token = this.getAccessToken()
    if (!token || token === 'undefined' || token === 'null') {
      return false
    }

    // Verificar se o token não expirou
    return !this.isTokenExpired()
  }

  /**
   * Verifica se o token expirou
   */
  isTokenExpired(): boolean {
    const expiresAt = this.getTokenExpiresAt()
    if (!expiresAt) {
      return true
    }

    return Date.now() >= expiresAt
  }

  /**
   * Verifica se o token está próximo de expirar (menos de 5 minutos)
   */
  isTokenExpiringSoon(thresholdMinutes: number = 5): boolean {
    const expiresAt = this.getTokenExpiresAt()
    if (!expiresAt) {
      return false
    }

    const now = Date.now()
    const threshold = thresholdMinutes * 60 * 1000

    return expiresAt - now < threshold && expiresAt - now > 0
  }

  /**
   * Obtém o tempo restante até a expiração (em segundos)
   */
  getTimeUntilExpiration(): number {
    const expiresAt = this.getTokenExpiresAt()
    if (!expiresAt) {
      return 0
    }

    const remaining = Math.max(0, expiresAt - Date.now())
    return Math.floor(remaining / 1000)
  }

  /**
   * Obtém o tempo restante formatado (ex: "59m 30s")
   */
  getFormattedTimeUntilExpiration(): string {
    const seconds = this.getTimeUntilExpiration()

    if (seconds <= 0) {
      return 'Expirado'
    }

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  /**
   * Atualiza apenas o access token (mantém o refresh token)
   */
  updateAccessToken(token: string, expiresIn: number): void {
    setItem(STORAGE_KEYS.AUTH_TOKEN, token)

    const expiresAt = Date.now() + expiresIn * 1000
    setItem(STORAGE_KEYS.TOKEN_EXPIRES_AT, expiresAt)

    console.log('✅ Access token atualizado')
    console.log(`⏰ Novo token expira em: ${expiresIn}s`)
  }

  /**
   * Limpa todos os tokens
   */
  clearTokens(): void {
    removeItem(STORAGE_KEYS.AUTH_TOKEN)
    removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    removeItem(STORAGE_KEYS.TOKEN_EXPIRES_AT)

    console.log('🧹 Tokens limpos do localStorage')
  }

  /**
   * Verifica se o token precisa ser renovado automaticamente
   */
  shouldRefreshToken(thresholdMinutes: number = 5): boolean {
    return this.hasValidToken() && this.isTokenExpiringSoon(thresholdMinutes)
  }

  /**
   * Obtém informações completas sobre o estado dos tokens
   */
  getTokenInfo(): {
    hasToken: boolean
    isExpired: boolean
    isExpiringSoon: boolean
    timeRemaining: number
    formattedTime: string
    expiresAt: Date | null
  } {
    const expiresAt = this.getTokenExpiresAt()

    return {
      hasToken: !!this.getAccessToken(),
      isExpired: this.isTokenExpired(),
      isExpiringSoon: this.isTokenExpiringSoon(),
      timeRemaining: this.getTimeUntilExpiration(),
      formattedTime: this.getFormattedTimeUntilExpiration(),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    }
  }

  /**
   * Debug: Mostra informações dos tokens no console
   */
  debugTokens(): void {
    const info = this.getTokenInfo()
    console.group('🔐 Token Debug Info')
    console.log('Has Token:', info.hasToken)
    console.log('Is Expired:', info.isExpired)
    console.log('Is Expiring Soon:', info.isExpiringSoon)
    console.log('Time Remaining:', info.formattedTime)
    console.log('Expires At:', info.expiresAt?.toLocaleString() || 'N/A')
    console.log('Access Token:', this.getAccessToken()?.substring(0, 20) + '...')
    console.log('Refresh Token:', this.getRefreshToken() ? 'Present' : 'Missing')
    console.groupEnd()
  }
}

// Singleton instance
export const tokenService = new TokenService()

// Export para uso conveniente
export default tokenService
