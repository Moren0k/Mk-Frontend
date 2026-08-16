import { watch } from 'vue'
import { useBacboproStore } from '@/stores/bacbopro'
import { useNotificationsStore } from '@/stores/notifications'

/**
 * Une los errores de red/API del store bacbopro con el sistema de
 * notificaciones visual: se muestran como toast en la esquina inferior
 * izquierda.
 */
export function useBacboproNotifications(): void {
  const store = useBacboproStore()
  const notifications = useNotificationsStore()

  const errorRefs = [
    () => store.oficial.patchError,
    () => store.pruebas.patchError,
    () => store.oficial.cancelError,
    () => store.pruebas.cancelError,
    () => store.streamError,
    () => store.sendReportError,
    () => store.historyError,
    () => store.summaryError,
    () => store.strategiesError,
    () => store.healthError,
  ]

  for (const getError of errorRefs) {
    watch(getError, (message) => {
      if (message) notifications.pushToast(message, 'error')
    })
  }
}
