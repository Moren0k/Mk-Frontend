import { ref } from 'vue'
import { login } from '@/api/endpoints'
import { clearRuntimeApiKey, getRuntimeApiKey, setRuntimeApiKey } from '@/api/session'

/**
 * Gate de acceso del panel: la contraseña se valida en el backend
 * (POST /auth/login, ver documentacion_mk_api.md §4.12) — nunca se
 * compara en el cliente. Si acierta, el backend devuelve la API key real,
 * que se guarda en memoria/sessionStorage (ver session.ts) y se usa para
 * el resto de la sesión. Ni la contraseña ni la API key quedan jamás
 * incrustadas en el JS compilado del frontend.
 */

function computeInitialUnlocked(): boolean {
  // Conveniencia solo en desarrollo local (ver `getApiKey` en config.ts):
  // con VITE_API_KEY definida, `pnpm dev` salta el login. Eliminado por
  // Vite (dead-code elimination) en cualquier build de producción.
  if (import.meta.env.DEV) {
    const devKey = import.meta.env.VITE_API_KEY?.trim()
    if (devKey) return true
  }
  return getRuntimeApiKey() !== null
}

const isUnlocked = ref(computeInitialUnlocked())

export function useAccessGate() {
  async function unlock(password: string): Promise<void> {
    const response = await login(password)
    setRuntimeApiKey(response.data.apiKey)
    isUnlocked.value = true
  }

  function lock(): void {
    clearRuntimeApiKey()
    isUnlocked.value = false
  }

  return { isUnlocked, unlock, lock }
}
