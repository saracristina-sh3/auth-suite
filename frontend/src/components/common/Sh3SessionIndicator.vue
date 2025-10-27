<template>
  <Transition name="fade-slide">
    <div
      v-if="show"
      class="fixed bottom-4 right-4 z-50 max-w-md animate-bounce-in"
    >
      <div
        :class="[
          'rounded-lg shadow-2xl border-2 p-4 backdrop-blur-sm',
          cardClasses
        ]"
      >
        <div class="flex items-start gap-3">
          <div
            :class="[
              'rounded-full p-2 flex-shrink-0',
              iconBgClasses
            ]"
          >
            <i
              :class="[
                'text-xl',
                iconClasses,
                isRefreshing && 'pi-spin'
              ]"
            ></i>
          </div>

          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-sm mb-1" :class="titleClasses">
              {{ title }}
            </h3>
            <p class="text-xs opacity-90 mb-2" :class="textClasses">
              {{ message }}
            </p>

            <div v-if="showTimeRemaining && timeRemaining" class="mb-3">
              <div class="flex items-center gap-2 text-xs" :class="textClasses">
                <i class="pi pi-clock"></i>
                <span class="font-mono font-semibold">{{ timeRemaining }}</span>
              </div>

              <div class="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  class="h-full transition-all duration-1000 ease-linear"
                  :class="progressBarClasses"
                  :style="{ width: `${progressPercentage}%` }"
                ></div>
              </div>
            </div>

            <div class="flex gap-2">
              <button
                v-if="showRefreshButton"
                @click="handleRefresh"
                :disabled="isRefreshing"
                class="px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                :class="refreshButtonClasses"
              >
                <i v-if="isRefreshing" class="pi pi-spin pi-spinner mr-1"></i>
                <i v-else class="pi pi-refresh mr-1"></i>
                {{ isRefreshing ? 'Renovando...' : 'Renovar Agora' }}
              </button>

              <button
                v-if="showDismissButton"
                @click="handleDismiss"
                class="px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 hover:scale-105"
                :class="dismissButtonClasses"
              >
                <i class="pi pi-times mr-1"></i>
                Dispensar
              </button>
            </div>
          </div>

          <button
            @click="handleClose"
            class="text-white/70 hover:text-white transition-colors flex-shrink-0 ml-2"
          >
            <i class="pi pi-times text-sm"></i>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useTokenRefresh } from '@/composables/common/useTokenRefresh'

interface Props {
  autoShow?: boolean
  warningThreshold?: number
  showRefreshButton?: boolean
  showDismissButton?: boolean
  showTimeRemaining?: boolean
  autoCloseOnRefresh?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoShow: true,
  warningThreshold: 5,
  showRefreshButton: true,
  showDismissButton: true,
  showTimeRemaining: true,
  autoCloseOnRefresh: true,
})

const emit = defineEmits<{
  refresh: []
  dismiss: []
  close: []
}>()

const {
  sessionExpiring,
  isRefreshing,
  refreshToken,
  tokenInfo,
  getTimeRemaining,
} = useTokenRefresh({
  autoRefresh: false,
  refreshThreshold: props.warningThreshold,
})

const show = ref(false)
const dismissed = ref(false)

let updateInterval: number | null = null

const timeRemaining = ref<string>('')

function startTimeUpdate() {
  if (updateInterval) return

  updateInterval = window.setInterval(() => {
    timeRemaining.value = getTimeRemaining()
  }, 1000)
}

function stopTimeUpdate() {
  if (updateInterval) {
    window.clearInterval(updateInterval)
    updateInterval = null
  }
}

watch(sessionExpiring, (expiring) => {
  if (expiring && props.autoShow && !dismissed.value) {
    show.value = true
    startTimeUpdate()
  } else if (!expiring) {
    show.value = false
    dismissed.value = false
    stopTimeUpdate()
  }
})

const progressPercentage = computed(() => {
  const info = tokenInfo.value
  if (!info.expiresAt) return 100

  const now = Date.now()
  const expiresAt = info.expiresAt.getTime()
  const warningTime = props.warningThreshold * 60 * 1000

  const elapsed = now - (expiresAt - warningTime)
  const total = warningTime

  return Math.max(0, Math.min(100, ((total - elapsed) / total) * 100))
})

const urgency = computed(() => {
  const remaining = tokenInfo.value.timeRemaining
  if (remaining <= 60) return 'critical' 
  if (remaining <= 180) return 'urgent'
  return 'warning' 
})

const cardClasses = computed(() => {
  switch (urgency.value) {
    case 'critical':
      return 'bg-gradient-to-br from-red-600 to-red-700 border-red-500 text-white'
    case 'urgent':
      return 'bg-gradient-to-br from-orange-600 to-orange-700 border-orange-500 text-white'
    default:
      return 'bg-gradient-to-br from-amber-600 to-amber-700 border-amber-500 text-white'
  }
})

const iconBgClasses = computed(() => {
  switch (urgency.value) {
    case 'critical':
      return 'bg-red-500/30'
    case 'urgent':
      return 'bg-orange-500/30'
    default:
      return 'bg-amber-500/30'
  }
})

const iconClasses = computed(() => {
  if (isRefreshing.value) return 'pi pi-spinner text-white'

  switch (urgency.value) {
    case 'critical':
      return 'pi pi-exclamation-triangle text-white'
    case 'urgent':
      return 'pi pi-clock text-white'
    default:
      return 'pi pi-info-circle text-white'
  }
})

const titleClasses = computed(() => 'text-white')
const textClasses = computed(() => 'text-white/90')

const progressBarClasses = computed(() => {
  switch (urgency.value) {
    case 'critical':
      return 'bg-red-200'
    case 'urgent':
      return 'bg-orange-200'
    default:
      return 'bg-amber-200'
  }
})

const refreshButtonClasses = computed(() => {
  return 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
})

const dismissButtonClasses = computed(() => {
  return 'bg-white/10 hover:bg-white/20 text-white/90 border border-white/20'
})

// Mensagens dinâmicas
const title = computed(() => {
  if (isRefreshing.value) return 'Renovando Sessão...'

  switch (urgency.value) {
    case 'critical':
      return '⚠️ Sessão Expirando!'
    case 'urgent':
      return 'Sessão Expirando em Breve'
    default:
      return 'Aviso de Sessão'
  }
})

const message = computed(() => {
  if (isRefreshing.value) return 'Aguarde enquanto renovamos sua sessão...'

  switch (urgency.value) {
    case 'critical':
      return 'Sua sessão está prestes a expirar. Renove agora para continuar.'
    case 'urgent':
      return 'Sua sessão expirará em breve. Clique em renovar para continuar.'
    default:
      return 'Sua sessão está expirando. Você pode renovar agora ou continuar trabalhando.'
  }
})

async function handleRefresh() {
  emit('refresh')
  const success = await refreshToken()

  if (success && props.autoCloseOnRefresh) {
    handleClose()
  }
}

function handleDismiss() {
  dismissed.value = true
  show.value = false
  emit('dismiss')
}

function handleClose() {
  show.value = false
  stopTimeUpdate()
  emit('close')
}

onUnmounted(() => {
  stopTimeUpdate()
})

defineExpose({
  show: () => {
    show.value = true
    startTimeUpdate()
  },
  hide: () => {
    show.value = false
    stopTimeUpdate()
  },
})
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.8) translateX(50px);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateX(0);
  }
}

.animate-bounce-in {
  animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
</style>
