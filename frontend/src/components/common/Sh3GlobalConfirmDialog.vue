<template>
  <Sh3ConfirmDialog
    v-model:visible="dialogState.visible"
    :title="dialogState.title"
    :message="dialogState.message"
    :confirmLabel="dialogState.confirmLabel"
    :severity="dialogState.severity"
    :itemDetails="dialogState.itemDetails"
    :warning="dialogState.warning"
    :loading="dialogState.loading"
    @confirm="confirm"
    @cancel="cancel"
  />
</template>

<script setup lang="ts">
import { useConfirmDialog } from '@/composables/common/useConfirmDialog'
import Sh3ConfirmDialog from './Sh3ConfirmDialog.vue';

const { dialogState, confirm, cancel } = useConfirmDialog()
</script>
