import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { startEventsStream } from '@/api/sse'
import type { OperationEvent, GameReceivedEvent, StatsRollingEvent } from '@/api/types'

const gameData = {
  type: 'game.received',
  payload: {
    roundId: '019fef13-0000-0000-0000-000000000001',
    winner: 'BANKER',
    score: 9,
    playedAt: '2026-08-11T04:28:11.765Z',
  },
  occurredAt: '2026-08-11T04:28:10.828Z',
}

const operationData = {
  type: 'operation.mg1',
  payload: {
    operationId: 'e16635df-0000-0000-0000-000000000002',
    strategyId: 'streak-4',
    recommendedWinner: 'PLAYER',
    streakWinner: 'BANKER',
    currentState: 'MG1',
    currentMartingale: 1,
    reason: 'Racha de 4 resultados consecutivos de BANKER.',
    openedAt: '2026-08-11T04:27:32.830Z',
    closedAt: null,
  },
  occurredAt: '2026-08-11T04:28:10.826Z',
}

function sseResponse(chunks: string[]): Response {
  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk))
      }
      controller.close()
    },
  })
  return new Response(stream, { status: 200, headers: { 'Content-Type': 'text/event-stream' } })
}

describe('startEventsStream', () => {
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
  })

  it('parses event, id and data lines and dispatches documented events', async () => {
    const onGameReceived = vi.fn()
    const onStatsRolling = vi.fn()
    const onOperation = vi.fn()

    const frame =
      'event: game.received\nid: 2\ndata: ' +
      JSON.stringify(gameData) +
      '\n\nevent: stats.rolling\nid: 3\ndata: ' +
      JSON.stringify({
        type: 'stats.rolling',
        payload: { window: 200, playerPct: 46, bankerPct: 43, tiePct: 11 },
        occurredAt: '2026-08-11T04:28:10.828Z',
      }) +
      '\n\nevent: operation.mg1\nid: 1\ndata: ' +
      JSON.stringify(operationData) +
      '\n\n'

    fetchMock.mockResolvedValue(sseResponse([frame]))

    await startEventsStream({ onGameReceived, onStatsRolling, onOperation })

    await vi.waitFor(() => expect(onGameReceived).toHaveBeenCalledTimes(1))
    const gameEvent = onGameReceived.mock.calls[0]![0] as GameReceivedEvent
    expect(gameEvent.payload.roundId).toBe('019fef13-0000-0000-0000-000000000001')
    expect(gameEvent.payload.winner).toBe('BANKER')
    expect(gameEvent.payload.score).toBe(9)

    const rollingEvent = onStatsRolling.mock.calls[0]![0] as StatsRollingEvent
    expect(rollingEvent.payload.window).toBe(200)
    expect(rollingEvent.payload.bankerPct).toBe(43)

    const operationEvent = onOperation.mock.calls[0]![0] as OperationEvent
    expect(operationEvent.payload.currentState).toBe('MG1')
    expect(operationEvent.payload.currentMartingale).toBe(1)
  })

  it('handles frames split across multiple chunks', async () => {
    const onGameReceived = vi.fn()
    const part1 = 'event: game.received\nid: 7\n'
    const part2 = 'data: ' + JSON.stringify(gameData) + '\n\n'

    fetchMock.mockResolvedValue(sseResponse([part1, part2]))

    await startEventsStream({ onGameReceived })

    await vi.waitFor(() => expect(onGameReceived).toHaveBeenCalledTimes(1))
  })

  it('ignores unknown event types', async () => {
    const onGameReceived = vi.fn()
    const onOperation = vi.fn()
    const frame =
      'event: something.new\ndata: {"type":"something.new","payload":{"a":1},"occurredAt":"2026-08-11T04:28:10.828Z"}\n\n'

    fetchMock.mockResolvedValue(sseResponse([frame]))

    await startEventsStream({ onGameReceived, onOperation })

    await new Promise((resolve) => setTimeout(resolve, 25))
    expect(onGameReceived).not.toHaveBeenCalled()
    expect(onOperation).not.toHaveBeenCalled()
  })

  it('ignores malformed JSON data without crashing', async () => {
    const onGameReceived = vi.fn()
    const frame = 'event: game.received\ndata: {not-json}\n\n'

    fetchMock.mockResolvedValue(sseResponse([frame]))

    await startEventsStream({ onGameReceived })

    await new Promise((resolve) => setTimeout(resolve, 25))
    expect(onGameReceived).not.toHaveBeenCalled()
  })

  it('ignores frames without an event name', async () => {
    const onGameReceived = vi.fn()
    const frame = 'data: ' + JSON.stringify(gameData) + '\n\n'

    fetchMock.mockResolvedValue(sseResponse([frame]))

    await startEventsStream({ onGameReceived })

    await new Promise((resolve) => setTimeout(resolve, 25))
    expect(onGameReceived).not.toHaveBeenCalled()
  })

  it('sends X-Api-Key and Accept: text/event-stream headers', async () => {
    fetchMock.mockResolvedValue(sseResponse([]))

    await startEventsStream({})

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('http://api.test:3000/api/v1/events/stream')
    expect((init.headers as Record<string, string>)['X-Api-Key']).toBe('test-secret')
    expect((init.headers as Record<string, string>).Accept).toBe('text/event-stream')
  })

  it('rejects with the API error when the endpoint answers non-2xx', async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            error: {
              code: 'UNAUTHORIZED',
              message: 'Unauthorized',
              requestId: 'req-401',
              timestamp: '2026-08-11T03:43:10.814Z',
            },
          }),
          { status: 401, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    )

    await expect(startEventsStream({})).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
      httpStatus: 401,
    })
  })

  it('rejects with NETWORK_ERROR when fetch fails', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))

    await expect(startEventsStream({})).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
    })
  })

  it('abort stops the stream without reporting an error', async () => {
    const onError = vi.fn()
    const stream = new ReadableStream<Uint8Array>({
      start() {
        return
      },
    })
    fetchMock.mockResolvedValue(
      new Response(stream, { status: 200, headers: { 'Content-Type': 'text/event-stream' } }),
    )

    const controller = await startEventsStream({ onError })
    controller.abort()

    await new Promise((resolve) => setTimeout(resolve, 25))
    expect(onError).not.toHaveBeenCalled()
  })
})
