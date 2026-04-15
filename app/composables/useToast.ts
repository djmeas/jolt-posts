const toasts = ref<Array<{ id: number; message: string; type: 'success' | 'error' }>>([])
let nextId = 0

export function useToast() {
  function show(message: string, type: 'success' | 'error' = 'success') {
    const id = nextId++
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, 3000)
  }

  return {
    toasts,
    show
  }
}
