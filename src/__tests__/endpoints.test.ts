import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiRequest } from '@/api/client'
import { startEventsStream } from '@/api/sse'
import {
  cancelOperation,
  getChannel,
  getHealth,
  getHistory,
  getOperations,
  getReportsSummary,
  getStatistics,
  getStrategies,
  openEventsStream,
  patchChannel,
  postAdminReports,
} from '@/api/endpoints'
import type { SseEventHandlers } from '@/api/types'

vi.mock('@/api/client', () => ({
  apiRequest: vi.fn(),
}))

vi.mock('@/api/sse', () => ({
  startEventsStream: vi.fn(),
}))

const apiRequestMock = vi.mocked(apiRequest)
const startEventsStreamMock = vi.mocked(startEventsStream)

describe('endpoints', () => {
  beforeEach(() => {
    apiRequestMock.mockReset()
    startEventsStreamMock.mockReset()
    apiRequestMock.mockResolvedValue({ data: null, requestId: 'r1' } as never)
  })

  it('getHealth uses GET /health without auth', async () => {
    await getHealth()
    expect(apiRequestMock).toHaveBeenCalledWith({ path: '/health', auth: false })
  })

  it('getStatistics uses GET /statistics', async () => {
    await getStatistics()
    expect(apiRequestMock).toHaveBeenCalledWith({ path: '/statistics' })
  })

  it('getHistory sends limit and defaults to 50', async () => {
    await getHistory()
    expect(apiRequestMock).toHaveBeenCalledWith({ path: '/history', query: { limit: 50 } })

    await getHistory(200)
    expect(apiRequestMock).toHaveBeenCalledWith({ path: '/history', query: { limit: 200 } })
  })

  it('getHistory casts the paginated meta', async () => {
    apiRequestMock.mockResolvedValue({
      data: [],
      meta: { limit: 3, count: 2 },
      requestId: 'r2',
    } as never)

    const response = await getHistory(3)
    expect(response.meta).toEqual({ limit: 3, count: 2 })
  })

  it('getOperations requires the channel as query param', async () => {
    await getOperations('oficial')
    expect(apiRequestMock).toHaveBeenCalledWith({
      path: '/operations',
      query: { channel: 'oficial' },
    })

    await getOperations('pruebas')
    expect(apiRequestMock).toHaveBeenCalledWith({
      path: '/operations',
      query: { channel: 'pruebas' },
    })
  })

  it('cancelOperation POSTs to the operation id path', async () => {
    await cancelOperation('op-123')
    expect(apiRequestMock).toHaveBeenCalledWith({
      path: '/operations/op-123/cancel',
      method: 'POST',
    })
  })

  it('getChannel and patchChannel target the channel path param', async () => {
    await getChannel('oficial')
    expect(apiRequestMock).toHaveBeenCalledWith({ path: '/channels/oficial' })

    const body = { strategyId: 'streak-4', active: true }
    await patchChannel('pruebas', body)
    expect(apiRequestMock).toHaveBeenCalledWith({
      path: '/channels/pruebas',
      method: 'PATCH',
      body,
    })
  })

  it('getReportsSummary uses GET /reports/summary without params', async () => {
    await getReportsSummary()
    expect(apiRequestMock).toHaveBeenCalledWith({ path: '/reports/summary' })
  })

  it('postAdminReports POSTs with channel and defaults to todos', async () => {
    await postAdminReports()
    expect(apiRequestMock).toHaveBeenCalledWith({
      path: '/admin/reports',
      method: 'POST',
      query: { channel: 'todos' },
    })

    await postAdminReports('oficial')
    expect(apiRequestMock).toHaveBeenCalledWith({
      path: '/admin/reports',
      method: 'POST',
      query: { channel: 'oficial' },
    })
  })

  it('getStrategies uses GET /strategies', async () => {
    await getStrategies()
    expect(apiRequestMock).toHaveBeenCalledWith({ path: '/strategies' })
  })

  it('openEventsStream delegates to the SSE client with the handlers', async () => {
    const handlers: SseEventHandlers = { onGameReceived: vi.fn() }
    const controller = { abort: vi.fn() }
    startEventsStreamMock.mockResolvedValue(controller)

    const result = await openEventsStream(handlers)

    expect(startEventsStreamMock).toHaveBeenCalledWith(handlers)
    expect(result).toBe(controller)
  })
})
