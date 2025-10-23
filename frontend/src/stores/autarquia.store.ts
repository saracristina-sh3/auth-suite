import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/auth.service'
import type { Autarquia } from '@/types/autarquia.types'

type SessionAutarquiaResponse = {
  autarquia_id: number | null
  autarquia: Autarquia | null
}

export const useAutarquiaStore = defineStore('autarquia', () => {
  // Mantemos o contexto da autarquia em um único ponto para refletir a sessão do backend
  const autarquiaId = ref<number | null>(null)
  const autarquia = ref<Autarquia | null>(null)
  const loading = ref(false)
  const lastSyncedAt = ref<number | null>(null)

  async function fetchAutarquia() {
    loading.value = true
    try {
      const { data } = await api.get<SessionAutarquiaResponse>('/session/autarquia')
      autarquiaId.value = data.autarquia_id ?? null
      autarquia.value = data.autarquia ?? null
      lastSyncedAt.value = Date.now()
      return autarquia.value
    } finally {
      loading.value = false
    }
  }

  async function setAutarquia(id: number) {
    loading.value = true
    try {
      const { data } = await api.post<SessionAutarquiaResponse>('/session/autarquia', {
        autarquia_id: id,
      })
      autarquiaId.value = data.autarquia_id ?? id
      autarquia.value = data.autarquia ?? null
      lastSyncedAt.value = Date.now()
      return autarquia.value
    } finally {
      loading.value = false
    }
  }

  function setFromSupportContext(context: Autarquia | null) {
    autarquia.value = context
    autarquiaId.value = context?.id ?? null
    lastSyncedAt.value = Date.now()
  }

  function clear() {
    autarquiaId.value = null
    autarquia.value = null
    lastSyncedAt.value = null
  }

  return {
    autarquiaId,
    autarquia,
    loading,
    lastSyncedAt,
    fetchAutarquia,
    setAutarquia,
    setFromSupportContext,
    clear,
  }
})
