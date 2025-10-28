<script setup lang="ts">
import GlobalConfirmDialog from '@/components/common/Sh3GlobalConfirmDialog.vue'
import { useCrossTabSync } from '@/composables/common/useCrossTabSync'

// Ativar sincronização entre abas
useCrossTabSync()
</script>

<template>
  <RouterView />
  <GlobalConfirmDialog />
</template>

<style>

</style>
