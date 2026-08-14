/**
 * API key obtenida en runtime vía POST /auth/login (ver endpoints.ts),
 * nunca incrustada en el build. Vive en memoria + sessionStorage (se
 * pierde al cerrar la pestaña/navegador, no persiste indefinidamente en
 * el dispositivo).
 */

const STORAGE_KEY = 'mkbacbo:apiKey'

let runtimeApiKey: string | null = null

export function getRuntimeApiKey(): string | null {
  if (runtimeApiKey !== null) return runtimeApiKey
  try {
    runtimeApiKey = window.sessionStorage.getItem(STORAGE_KEY)
  } catch {
    runtimeApiKey = null
  }
  return runtimeApiKey
}

export function setRuntimeApiKey(apiKey: string): void {
  runtimeApiKey = apiKey
  try {
    window.sessionStorage.setItem(STORAGE_KEY, apiKey)
  } catch {
    // sessionStorage no disponible (p. ej. modo privado estricto): la key
    // sigue en memoria para esta pestaña.
  }
}

export function clearRuntimeApiKey(): void {
  runtimeApiKey = null
  try {
    window.sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // no-op
  }
}
