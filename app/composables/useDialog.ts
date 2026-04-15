const dialog = ref({
  open: false,
  title: '',
  message: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  danger: false
})

let resolveDialog: ((value: boolean) => void) | null = null

export function useDialog() {
  function confirm(options: {
    title?: string
    message: string
    confirmText?: string
    cancelText?: string
    danger?: boolean
  }): Promise<boolean> {
    dialog.value = {
      open: true,
      title: options.title || '',
      message: options.message,
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
      danger: options.danger || false
    }

    return new Promise((resolve) => {
      resolveDialog = resolve
    })
  }

  function handleConfirm() {
    dialog.value.open = false
    resolveDialog?.(true)
    resolveDialog = null
  }

  function handleCancel() {
    dialog.value.open = false
    resolveDialog?.(false)
    resolveDialog = null
  }

  return {
    dialog,
    confirm,
    handleConfirm,
    handleCancel
  }
}
