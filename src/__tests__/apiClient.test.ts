import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ApiError, apiRequest, parseApiErrorResponse } from '@/api/client'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const errorBody = (code: string, message: string, status: number) =>
  new Response(
    JSON.stringify({
      error: {
        code,
        message,
        details: [{ reason: 'campo inválido' }],
        requestId: 'req-123',
        timestamp: '2026-08-11T03:36:28.016Z',
      },
    }),
    { status, headers: { 'Content-Type': 'application/json' } },
  )

describe('apiRequest', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://api.test:3000/api/v1')
    vi.stubEnv('VITE_API_KEY', 'test-secret')
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('GET builds the URL with base, path and query, and sends Accept + X-Api-Key', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: [], requestId: 'r1' }))

    await apiRequest<unknown[]>({ path: '/history', query: { limit: 200 } })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('http://api.test:3000/api/v1/history?limit=200')
    expect(init.method).toBe('GET')
    expect((init.headers as Record<string, string>)['X-Api-Key']).toBe('test-secret')
    expect((init.headers as Record<string, string>).Accept).toBe('application/json')
    expect(init.body).toBeUndefined()
  })

  it('returns the parsed envelope on success', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: { ok: true }, requestId: 'r2' }))

    const result = await apiRequest<{ ok: boolean }>({ path: '/health', auth: false })

    expect(result).toEqual({ data: { ok: true }, requestId: 'r2' })
  })

  it('auth: false does not send the X-Api-Key header', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: {}, requestId: 'r3' }))

    await apiRequest<unknown>({ path: '/health', auth: false })

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect((init.headers as Record<string, string>)['X-Api-Key']).toBeUndefined()
  })

  it('does not send X-Api-Key when no API key is configured', async () => {
    vi.stubEnv('VITE_API_KEY', '')
    fetchMock.mockResolvedValue(jsonResponse({ data: {}, requestId: 'r4' }))

    await apiRequest<unknown>({ path: '/statistics' })

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect((init.headers as Record<string, string>)['X-Api-Key']).toBeUndefined()
  })

  it('POST serializes the body as JSON with Content-Type', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: {}, requestId: 'r5' }))

    await apiRequest<unknown>({ path: '/operations/op-1/cancel', method: 'POST' })

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('http://api.test:3000/api/v1/operations/op-1/cancel')
    expect(init.method).toBe('POST')
    expect(init.body).toBeUndefined()
  })

  it('PATCH sends method PATCH and the JSON body', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: {}, requestId: 'r6' }))
    const body = { strategyId: 'streak-4', active: true }

    await apiRequest<unknown>({ path: '/channels/oficial', method: 'PATCH', body })

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(init.method).toBe('PATCH')
    expect(JSON.parse(init.body as string)).toEqual(body)
    expect((init.headers as Record<string, string>)['Content-Type']).toBe(
      'application/json',
    )
  })

  it('normalizes documented HTTP errors into ApiError', async () => {
    const cases: Array<[string, number]> = [
      ['VALIDATION_ERROR', 400],
      ['UNAUTHORIZED', 401],
      ['NOT_FOUND', 404],
      ['CONFLICT', 409],
      ['INTERNAL', 500],
    ]

    for (const [code, status] of cases) {
      fetchMock.mockResolvedValue(errorBody(code, 'mensaje', status))
      await expect(apiRequest<unknown>({ path: '/statistics' })).rejects.toMatchObject({
        name: 'ApiError',
        code,
        httpStatus: status,
        message: 'mensaje',
        requestId: 'req-123',
      })
    }
  })

  it('non-JSON error response becomes INVALID_RESPONSE with the HTTP status', async () => {
    fetchMock.mockResolvedValue(new Response('internal server error', { status: 502 }))

    await expect(apiRequest<unknown>({ path: '/statistics' })).rejects.toMatchObject({
      code: 'INVALID_RESPONSE',
      httpStatus: 502,
    })
  })

  it('non-JSON success response becomes INVALID_RESPONSE', async () => {
    fetchMock.mockResolvedValue(new Response('<html>ok</html>', { status: 200 }))

    await expect(apiRequest<unknown>({ path: '/health', auth: false })).rejects.toMatchObject(
      { code: 'INVALID_RESPONSE' },
    )
  })

  it('network failures become NETWORK_ERROR', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))

    await expect(apiRequest<unknown>({ path: '/statistics' })).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
      httpStatus: null,
    })
  })

  it('aborts after the timeout and reports NETWORK_ERROR', async () => {
    vi.useFakeTimers()
    fetchMock.mockImplementation(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => {
            reject(Object.assign(new Error('Aborted'), { name: 'AbortError' }))
          })
        }),
    )

    const pending = apiRequest<unknown>({ path: '/statistics', timeoutMs: 1000 })
    const assertion = expect(pending).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
      httpStatus: null,
    })
    await vi.advanceTimersByTimeAsync(1000)
    await assertion
  })

  it('parseApiErrorResponse returns ApiError with the envelope fields', async () => {
    const error = await parseApiErrorResponse(errorBody('CONFLICT', 'choca', 409))
    expect(error).toBeInstanceOf(ApiError)
    expect(error.code).toBe('CONFLICT')
    expect(error.httpStatus).toBe(409)
    expect(error.details).toEqual([{ reason: 'campo inválido' }])
    expect(error.timestamp).toBe('2026-08-11T03:36:28.016Z')
  })
})
