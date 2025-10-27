import { shallowRef, computed } from 'vue'

/**
 * Interface para item do cache
 */
interface CacheItem<T> {
  data: T
  timestamp: number
  expiresAt: number
}

/**
 * Configuração do cache
 */
interface CacheConfig {
  ttl?: number 
  key: string 
}

/**
 * Composable genérico para gerenciamento de cache
 *
 * @param config - Configuração do cache
 * @returns Objeto com métodos e estado do cache
 *
 * @example
 * ```typescript
 * const modulosCache = useCache<Modulo[]>({
 *   key: 'modulos',
 *   ttl: 5 * 60 * 1000 // 5 minutos
 * })
 *
 * // Buscar com cache
 * const modulos = await modulosCache.fetch(async () => {
 *   return await moduloService.list()
 * })
 *
 * // Invalidar cache
 * modulosCache.invalidate()
 * ```
 */
export function useCache<T>(config: CacheConfig) {
  const DEFAULT_TTL = 5 * 60 * 1000 // 5 minutos
  const ttl = config.ttl || DEFAULT_TTL
  const cacheKey = config.key

  const cache = shallowRef<Map<string, CacheItem<T>>>(new Map())

  /**
   * Verifica se o cache é válido
   */
  function isValid(key: string): boolean {
    const item = cache.value.get(key)
    if (!item) return false

    const now = Date.now()
    return now < item.expiresAt
  }

  /**
   * Obtém dados do cache se válidos
   */
  function get(key: string = cacheKey): T | null {
    if (!isValid(key)) {
      cache.value.delete(key)
      return null
    }

    const item = cache.value.get(key)
    return item ? item.data : null
  }

  /**
   * Armazena dados no cache
   */
  function set(data: T, key: string = cacheKey): void {
    const now = Date.now()
    const item: CacheItem<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl
    }

    cache.value.set(key, item)
  }

  /**
   * Invalida o cache (remove dados)
   */
  function invalidate(key?: string): void {
    if (key) {
      cache.value.delete(key)
    } else {

      cache.value.clear()
    }
  }

  /**
   * Invalida todos os caches expirados
   */
  function clearExpired(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    cache.value.forEach((item, key) => {
      if (now >= item.expiresAt) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach(key => cache.value.delete(key))
  }

  /**
   * Busca dados com cache
   * Se dados válidos existirem, retorna do cache
   * Caso contrário, executa a função de fetch e armazena no cache
   *
   * @param fetchFn - Função async que busca os dados
   * @param key - Chave opcional do cache
   * @param forceRefresh - Força atualização mesmo com cache válido
   */
  async function fetch(
    fetchFn: () => Promise<T>,
    key: string = cacheKey,
    forceRefresh: boolean = false
  ): Promise<T> {
    // Verificar cache primeiro
    if (!forceRefresh) {
      const cachedData = get(key)
      if (cachedData !== null) {
        console.log(`✅ Cache hit para '${key}'`)
        return cachedData
      }
    }

    console.log(`🔄 Cache miss para '${key}' - buscando dados...`)

    const data = await fetchFn()

    set(data, key)

    return data
  }

  /**
   * Computed que indica se há dados em cache válidos
   */
  const hasValidCache = computed(() => isValid(cacheKey))

  /**
   * Computed que retorna o tempo restante até expiração (em ms)
   */
  const timeToExpire = computed(() => {
    const item = cache.value.get(cacheKey)
    if (!item) return 0

    const now = Date.now()
    const remaining = item.expiresAt - now
    return remaining > 0 ? remaining : 0
  })

  /**
   * Computed que indica se o cache existe (mesmo que expirado)
   */
  const hasCache = computed(() => cache.value.has(cacheKey))

  setInterval(clearExpired, 60 * 1000)

  return {
    hasValidCache,
    hasCache,
    timeToExpire,

    get,
    set,
    fetch,
    invalidate,
    clearExpired,
    isValid
  }
}

/**
 * Cache global compartilhado (singleton)
 * Útil para compartilhar cache entre múltiplas instâncias
 */
const globalCache = new Map<string, any>()

/**
 * Cria uma instância de cache com store global
 */
export function useGlobalCache<T>(config: CacheConfig) {
  const cacheInstance = useCache<T>(config)

  const originalGet = cacheInstance.get
  const originalSet = cacheInstance.set
  const originalInvalidate = cacheInstance.invalidate

  return {
    ...cacheInstance,
    get: (key?: string) => {
      const k = key || config.key
      return globalCache.get(k) || originalGet(k)
    },
    set: (data: T, key?: string) => {
      const k = key || config.key
      globalCache.set(k, data)
      originalSet(data, k)
    },
    invalidate: (key?: string) => {
      const k = key || config.key
      if (k) {
        globalCache.delete(k)
      }
      originalInvalidate(k)
    }
  }
}
