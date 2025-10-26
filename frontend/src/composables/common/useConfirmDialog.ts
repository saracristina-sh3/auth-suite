import { ref } from 'vue'

export interface ConfirmDialogOptions {
  title?: string
  message: string
  confirmLabel?: string
  severity?: 'danger' | 'warning' | 'info'
  itemDetails?: Record<string, string>
  warning?: string
}

export interface ConfirmDialogState extends ConfirmDialogOptions {
  visible: boolean
  loading: boolean
  onConfirm: (() => void | Promise<void>) | null
  onCancel: (() => void) | null
}

const dialogState = ref<ConfirmDialogState>({
  visible: false,
  title: 'Confirmar ação',
  message: '',
  confirmLabel: 'Confirmar',
  severity: 'danger',
  loading: false,
  onConfirm: null,
  onCancel: null
})

export function useConfirmDialog() {
  /**
   * Abre o dialog de confirmação
   */
  const showConfirmDialog = (
    options: ConfirmDialogOptions,
    onConfirm: () => void | Promise<void>,
    onCancel?: () => void
  ) => {
    dialogState.value = {
      ...dialogState.value,
      ...options,
      visible: true,
      loading: false,
      onConfirm,
      onCancel: onCancel || null
    }
  }

  /**
   * Confirma a ação
   */
  const confirm = async () => {
    if (dialogState.value.onConfirm) {
      dialogState.value.loading = true
      try {
        await dialogState.value.onConfirm()
        dialogState.value.visible = false
      } catch (error) {
        console.error('Erro ao confirmar ação:', error)
      } finally {
        dialogState.value.loading = false
      }
    } else {
      dialogState.value.visible = false
    }
  }

  /**
   * Cancela a ação
   */
  const cancel = () => {
    if (dialogState.value.onCancel) {
      dialogState.value.onCancel()
    }
    dialogState.value.visible = false
  }

  /**
   * Fecha o dialog
   */
  const close = () => {
    dialogState.value.visible = false
  }

  /**
   * Atalhos para confirmações comuns
   */
  const confirmDelete = (
    itemName: string,
    onConfirm: () => void | Promise<void>,
    itemDetails?: Record<string, string>
  ) => {
    showConfirmDialog(
      {
        title: 'Confirmar exclusão',
        message: `Tem certeza que deseja excluir "${itemName}"?`,
        confirmLabel: 'Excluir',
        severity: 'danger',
        warning: 'Esta ação não pode ser desfeita.',
        itemDetails
      },
      onConfirm
    )
  }

  const confirmDeactivate = (
    itemName: string,
    onConfirm: () => void | Promise<void>,
    itemDetails?: Record<string, string>
  ) => {
    showConfirmDialog(
      {
        title: 'Confirmar inativação',
        message: `Tem certeza que deseja inativar "${itemName}"?`,
        confirmLabel: 'Inativar',
        severity: 'warning',
        warning: 'O item ficará indisponível para uso.',
        itemDetails
      },
      onConfirm
    )
  }

  const confirmActivate = (
    itemName: string,
    onConfirm: () => void | Promise<void>,
    itemDetails?: Record<string, string>
  ) => {
    showConfirmDialog(
      {
        title: 'Confirmar ativação',
        message: `Tem certeza que deseja ativar "${itemName}"?`,
        confirmLabel: 'Ativar',
        severity: 'info',
        itemDetails
      },
      onConfirm
    )
  }

  return {
    dialogState,
    showConfirmDialog,
    confirm,
    cancel,
    close,
    // Atalhos
    confirmDelete,
    confirmDeactivate,
    confirmActivate
  }
}
