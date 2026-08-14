import type { ApiErrorBody, ApiErrorCode, ApiErrorDetails, Envelope } from './types'
import { getApiBaseUrl, getApiKey } from './config'

export type ClientErrorCode = ApiErrorCode | 'NETWORK_ERROR' | 'INVALID_RESPONSE'

export interface ApiErrorInit {
  code: ClientErrorCode
  message: string
  httpStatus: number | null
  requestId?: string | null
  details?: ApiErrorDetails[]
  timestamp?: string
}

export class ApiError extends Error {
  readonly code: ClientErrorCode
  readonly httpStatus: number | null
  readonly requestId: string | null
  readonly details: ApiErrorDetails[] | undefined
  readonly timestamp: string | undefined

  constructor(init: ApiErrorInit) {
    super(init.message)
    this.name = 'ApiError'
    this.code = init.code
    this.httpStatus = init.httpStatus
    this.requestId = init.requestId ?? null
    this.details = init.details
    this.timestamp = init.timestamp
  }
}

export interface RequestOptions {
  path: string
  method?: 'GET' | 'POST' | 'PATCH'
  query?: Record<string, string | number | undefined>
  body?: unknown
  auth?: boolean
  timeoutMs?: number
}

const DEFAULT_TIMEOUT_MS = 15_000

function buildUrl(path: string, query?: Record<string, string | number | undefined>): string {
  const url = new URL(`${getApiBaseUrl()}${path}`)
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value))
    }
  }
  return url.toString()
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError'
}

export async function parseApiErrorResponse(response: Response): Promise<ApiError> {
  let body: ApiErrorBody | null = null
  try {
    body = (await response.json()) as ApiErrorBody
  } catch {
    body = null
  }

  if (body && typeof body === 'object' && body.error) {
    return new ApiError({
      code: body.error.code,
      message: body.error.message,
      httpStatus: response.status,
      requestId: body.error.requestId,
      details: body.error.details,
      timestamp: body.error.timestamp,
    })
  }

  return new ApiError({
    code: 'INVALID_RESPONSE',
    message: `Respuesta de error no esperada (HTTP ${response.status})`,
    httpStatus: response.status,
  })
}

export async function apiRequest<T>(options: RequestOptions): Promise<Envelope<T>> {
  const {
    path,
    method = 'GET',
    query,
    body,
    auth = true,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = options

  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  const apiKey = getApiKey()
  if (auth && apiKey) {
    headers['X-Api-Key'] = apiKey
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  let response: Response
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })
  } catch (error) {
    if (isAbortError(error)) {
      throw new ApiError({
        code: 'NETWORK_ERROR',
        message: 'La petición excedió el tiempo de espera',
        httpStatus: null,
      })
    }
    throw new ApiError({
      code: 'NETWORK_ERROR',
      message: error instanceof Error ? error.message : 'Error de red',
      httpStatus: null,
    })
  } finally {
    clearTimeout(timeoutId)
  }

  if (!response.ok) {
    throw await parseApiErrorResponse(response)
  }

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new ApiError({
      code: 'INVALID_RESPONSE',
      message: 'La respuesta no es JSON válido',
      httpStatus: response.status,
    })
  }

  return payload as Envelope<T>
}

export function get<T>(path: string, query?: Record<string, string | number | undefined>) {
  return apiRequest<T>({ path, method: 'GET', query })
}

export function post<T>(path: string, body?: unknown, query?: Record<string, string | number | undefined>) {
  return apiRequest<T>({ path, method: 'POST', body, query })
}

export function patch<T>(path: string, body: unknown) {
  return apiRequest<T>({ path, method: 'PATCH', body })
}
