import { getRuntimeApiKey } from './session'

const DEFAULT_API_BASE_URL = 'http://localhost:3000/api/v1'

export function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim()
  return (configured || DEFAULT_API_BASE_URL).replace(/\/+$/, '')
}

/**
 * La API key real se obtiene en runtime vía POST /auth/login (ver
 * session.ts) y nunca se incrusta en el build de producción.
 *
 * `VITE_API_KEY` solo existe como atajo de conveniencia en `pnpm dev`
 * local, para no tener que loguearse cada vez durante desarrollo — el
 * `if (import.meta.env.DEV)` hace que Vite elimine esta rama por completo
 * (dead-code elimination) en cualquier build de producción, así que
 * aunque alguien defina esa variable por error en el entorno de build,
 * nunca queda incrustada en el JS que se sirve a los usuarios. Aun así,
 * no se debe definir en el `.env` de un build de producción.
 */
export function getApiKey(): string {
  if (import.meta.env.DEV) {
    const devKey = import.meta.env.VITE_API_KEY?.trim()
    if (devKey) return devKey
  }
  return getRuntimeApiKey() ?? ''
}
