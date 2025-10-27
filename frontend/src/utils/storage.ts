/**
 * Utilitários seguros para trabalhar com localStorage
 *
 * Fornece wrappers seguros para localStorage com:
 * - Tratamento de erros
 * - Parse/stringify automático de JSON
 * - Tipagem TypeScript
 * - Fallback quando localStorage não está disponível
 */

/**
 * Verifica se localStorage está disponível
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

/**
 * Obtém um item do localStorage
 *
 * @param key - Chave do item
 * @param defaultValue - Valor padrão caso o item não exista ou ocorra erro
 * @returns O valor parseado ou o valor padrão
 *
 * @example
 * ```ts
 * const user = getItem<User>('user', null)
 * const settings = getItem('settings', { theme: 'light' })
 * ```
 */
export function getItem<T>(key: string, defaultValue: T): T {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage não está disponível')
    return defaultValue
  }

  try {
    const item = localStorage.getItem(key)

    if (item === null) {
      return defaultValue
    }

    try {
      return JSON.parse(item) as T
    } catch {
      return item as T
    }
  } catch (error) {
    console.error(`Erro ao obter item '${key}' do localStorage:`, error)
    return defaultValue
  }
}

/**
 * Salva um item no localStorage
 *
 * @param key - Chave do item
 * @param value - Valor a ser salvo (será convertido para JSON)
 * @returns true se salvou com sucesso, false caso contrário
 *
 * @example
 * ```ts
 * setItem('user', { id: 1, name: 'João' })
 * setItem('token', 'abc123')
 * ```
 */
export function setItem<T>(key: string, value: T): boolean {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage não está disponível')
    return false
  }

  try {
    const serialized = JSON.stringify(value)
    localStorage.setItem(key, serialized)
    return true
  } catch (error) {
    console.error(`Erro ao salvar item '${key}' no localStorage:`, error)
    return false
  }
}

/**
 * Remove um item do localStorage
 *
 * @param key - Chave do item a ser removido
 * @returns true se removeu com sucesso, false caso contrário
 *
 * @example
 * ```ts
 * removeItem('token')
 * removeItem('user')
 * ```
 */
export function removeItem(key: string): boolean {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage não está disponível')
    return false
  }

  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error(`Erro ao remover item '${key}' do localStorage:`, error)
    return false
  }
}

/**
 * Limpa todo o localStorage
 *
 * @returns true se limpou com sucesso, false caso contrário
 *
 * @example
 * ```ts
 * clear() // Remove todos os itens
 * ```
 */
export function clear(): boolean {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage não está disponível')
    return false
  }

  try {
    localStorage.clear()
    return true
  } catch (error) {
    console.error('Erro ao limpar localStorage:', error)
    return false
  }
}

/**
 * Verifica se uma chave existe no localStorage
 *
 * @param key - Chave a ser verificada
 * @returns true se a chave existe, false caso contrário
 *
 * @example
 * ```ts
 * if (hasItem('token')) {
 *   // Token existe
 * }
 * ```
 */
export function hasItem(key: string): boolean {
  if (!isLocalStorageAvailable()) {
    return false
  }

  try {
    return localStorage.getItem(key) !== null
  } catch (error) {
    console.error(`Erro ao verificar item '${key}' no localStorage:`, error)
    return false
  }
}

/**
 * Obtém todas as chaves do localStorage
 *
 * @returns Array com todas as chaves
 *
 * @example
 * ```ts
 * const keys = getKeys()
 * console.log('Chaves armazenadas:', keys)
 * ```
 */
export function getKeys(): string[] {
  if (!isLocalStorageAvailable()) {
    return []
  }

  try {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key !== null) {
        keys.push(key)
      }
    }
    return keys
  } catch (error) {
    console.error('Erro ao obter chaves do localStorage:', error)
    return []
  }
}

/**
 * Constantes para chaves comumente usadas no localStorage
 * Ajuda a evitar typos e centralizar as chaves
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER: 'user_data',
  REFRESH_TOKEN: 'refresh_token',
  TOKEN_EXPIRES_AT: 'token_expires_at',
  SUPPORT_CONTEXT: 'support_context',
  ORIGINAL_USER_DATA: 'original_user_data',
  AUTARQUIA_ATIVA: 'autarquia_ativa',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const

/**
 * Helper type para garantir type-safety com as chaves
 */
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS]
