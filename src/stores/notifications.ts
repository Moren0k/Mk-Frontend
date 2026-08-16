import { ref } from 'vue'
import { defineStore } from 'pinia'

export type ToastVariant = 'error' | 'warning' | 'info' | 'success'

export interface ToastMessage {
  id: number
  message: string
  variant: ToastVariant
}

const TOAST_DURATION_MS = 6000

export const useNotificationsStore = defineStore('notifications', () => {
  const toasts = ref<ToastMessage[]>([])
  let nextId = 1

  function pushToast(message: string, variant: ToastVariant = 'error'): void {
    const id = nextId++
    toasts.value.push({ id, message, variant })
    setTimeout(() => dismissToast(id), TOAST_DURATION_MS)
  }

  function dismissToast(id: number): void {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  return {
    toasts,
    pushToast,
    dismissToast,
  }
})
