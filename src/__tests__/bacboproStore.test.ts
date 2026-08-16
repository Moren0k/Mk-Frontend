import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useBacboproStore } from '@/stores/bacbopro'
import { ApiError } from '@/api/client'
import type {
  ChannelState,
  HistoryItem,
  OperationVm,
  SseEventHandlers,
} from '@/api/types'

vi.mock('@/api/endpoints', () => ({
  getChannel: vi.fn(),
  getOperations: vi.fn(),
  getHistory: vi.fn(),
  getReportsSummary: vi.fn(),
  getStrategies: vi.fn(),
  getHealth: vi.fn(),
  patchChannel: vi.fn(),
  cancelOperation: vi.fn(),
  postAdminReports: vi.fn(),
  openEventsStream: vi.fn(),
}))

import * as endpoints from '@/api/endpoints'

const oficialConfig: ChannelState = {
  channel: 'oficial',
  strategyId: 'streak-4',
  active: true,
  maxMartingalesOverride: null,
}

const pruebasConfig: ChannelState = {
  channel: 'pruebas',
  strategyId: null,
  active: false,
  maxMartingalesOverride: null,
}

function historyOf(count: number): HistoryItem[] {
  return Array.from({ length: count }, (_, index) => ({
    roundId: `round-${index}`,
    winner: index % 3 === 0 ? 'TIE' : index % 2 === 0 ? 'PLAYER' : 'BANKER',
    score: 9,
    playedAt: '2026-08-11T04:28:11.765Z',
  }))
}

function operationOf(strategyId: string, overrides: Partial<OperationVm> = {}): OperationVm {
  return {
    operationId: `op-${strategyId}`,
    strategyId,
    recommendedWinner: 'PLAYER',
    streakWinner: 'BANKER',
    currentState: 'OPEN',
    currentMartingale: 0,
    reason: 'Racha de 4 resultados consecutivos de BANKER.',
    openedAt: '2026-08-11T04:28:10.828Z',
    closedAt: null,
    ...overrides,
  }
}

let streamHandlers: SseEventHandlers | null = null
let abortSpy: ReturnType<typeof vi.fn>

describe('bacboproStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mocked(endpoints.getChannel).mockImplementation(async (channel) => ({
      data: channel === 'oficial' ? oficialConfig : pruebasConfig,
      requestId: 'r1',
    }))
    vi.mocked(endpoints.getOperations).mockImplementation(async (channel) => ({
      data: channel === 'oficial' ? [operationOf('streak-4')] : [],
      requestId: 'r2',
    }))
    vi.mocked(endpoints.getHistory).mockResolvedValue({
      data: historyOf(200),
      meta: { limit: 200, count: 200 },
      requestId: 'r3',
    })
    vi.mocked(endpoints.getReportsSummary).mockResolvedValue({
      data: {
        uptimeMs: 7385000,
        oficial: { won: 8, lost: 2, alertsSent: 10 },
        pruebas: { won: 0, lost: 0, alertsSent: 0 },
      },
      requestId: 'r4',
    })
    vi.mocked(endpoints.getStrategies).mockResolvedValue({
      data: [
        {
          id: 'streak-3',
          name: 'Streak3Strategy',
          description: 'Recomienda el ganador opuesto tras 3 resultados consecutivos iguales.',
        },
        {
          id: 'streak-4',
          name: 'Streak4Strategy',
          description: 'Recomienda el ganador opuesto tras 4 resultados consecutivos iguales.',
        },
      ],
      requestId: 'r5',
    })
    vi.mocked(endpoints.getHealth).mockResolvedValue({
      data: {
        ok: true,
        collectorConnected: true,
        lastGameReceivedAt: '2026-08-11T03:17:21.710Z',
        gamesInMemory: 200,
        activeOperations: 0,
        registeredStrategies: 3,
        registeredChannels: 2,
        lastError: null,
        db: { ok: true, latencyMs: 486 },
      },
      requestId: 'r6',
    })
    vi.mocked(endpoints.patchChannel).mockResolvedValue({
      data: oficialConfig,
      requestId: 'r7',
    })
    vi.mocked(endpoints.cancelOperation).mockResolvedValue({
      data: operationOf('streak-4', { currentState: 'CANCELLED', closedAt: '2026-08-11T04:30:00.000Z' }),
      requestId: 'r8',
    })
    vi.mocked(endpoints.postAdminReports).mockResolvedValue({
      data: {
        channel: 'todos',
        dispatchedAt: '2026-08-11T04:17:44.000Z',
        metrics: { oficial: {}, pruebas: {} },
      },
      requestId: 'r9',
    })
    abortSpy = vi.fn()
    streamHandlers = null
    vi.mocked(endpoints.openEventsStream).mockImplementation(async (handlers) => {
      streamHandlers = handlers
      return { abort: abortSpy }
    })
  })

  afterEach(() => {
    const store = useBacboproStore()
    store.dispose()
  })

  it('hydrate populates both channels, history, summary, strategies and health', async () => {
    const store = useBacboproStore()
    await store.hydrate()

    expect(store.oficial.config).toEqual(oficialConfig)
    expect(store.pruebas.config).toEqual(pruebasConfig)
    expect(store.oficial.operation?.strategyId).toBe('streak-4')
    expect(store.pruebas.operation).toBeNull()
    expect(store.history).toHaveLength(200)
    expect(store.summary?.oficial.won).toBe(8)
    expect(store.strategies.map((strategy) => strategy.id)).toEqual(['streak-3', 'streak-4'])
    expect(store.health?.collectorConnected).toBe(true)
    expect(store.oficial.loading).toBe(false)
    expect(store.pruebas.loading).toBe(false)
    expect(store.historyLoading).toBe(false)
  })

  it('oficialAlertSide reflects the bet side of an active OFICIAL operation', async () => {
    const store = useBacboproStore()
    await store.hydrate()

    // El mock por defecto abre 'oficial' con recommendedWinner PLAYER y
    // currentState OPEN — betOnSide debería ser 'player'.
    expect(store.oficialAlertSide).toBe('player')
  })

  it('oficialAlertSide is null once the OFICIAL operation is resolved (won/lost/cancelled)', async () => {
    vi.mocked(endpoints.getOperations).mockImplementation(async (channel) => ({
      data: channel === 'oficial' ? [operationOf('streak-4', { currentState: 'WON' })] : [],
      requestId: 'r2',
    }))
    const store = useBacboproStore()
    await store.hydrate()

    expect(store.oficialAlertSide).toBeNull()
  })

  it('oficialAlertSide is null when OFICIAL has no active operation, even if PRUEBAS does', async () => {
    vi.mocked(endpoints.getOperations).mockImplementation(async (channel) => ({
      data: channel === 'pruebas' ? [operationOf('streak-3')] : [],
      requestId: 'r2',
    }))
    const store = useBacboproStore()
    await store.hydrate()

    expect(store.oficial.operation).toBeNull()
    expect(store.pruebas.operation).not.toBeNull()
    expect(store.oficialAlertSide).toBeNull()
  })

  it('streakDisplayColumns matches the real cursor when there is no active alert', async () => {
    vi.mocked(endpoints.getOperations).mockResolvedValue({ data: [], requestId: 'r2' })
    const store = useBacboproStore()
    await store.hydrate()

    expect(store.oficialAlertSide).toBeNull()
    expect(store.streakDisplayColumns).toEqual(store.streakColumns)
  })

  it('regression: a pending cell on a FULL streak board never overlaps a real column', async () => {
    // 200 resultados alternando player/banker sin ties: cada uno abre su
    // propia columna (racha de 1), así que el Big Road queda con sus
    // STREAK_DISPLAY_COLUMNS (26) columnas completamente llenas — el
    // escenario donde el bug reportado ocurría (la simulación abría una
    // columna nueva, pero como el tope de columnas ya estaba al máximo, se
    // descartaba la más vieja SOLO en la simulación, no en el grid real, y
    // la celda pendiente terminaba dibujada encima de la última columna real).
    vi.mocked(endpoints.getHistory).mockResolvedValue({
      data: Array.from({ length: 200 }, (_, index) => ({
        roundId: `round-${index}`,
        winner: index % 2 === 0 ? 'PLAYER' : 'BANKER',
        score: 9,
        playedAt: '2026-08-11T04:28:11.765Z',
      })),
      meta: { limit: 200, count: 200 },
      requestId: 'r3',
    })
    const store = useBacboproStore()
    await store.hydrate()

    expect(store.streakColumns).toHaveLength(26)
    const realLastColumn = store.streakColumns[25]

    expect(store.oficialAlertSide).toBe('player')
    const pending = store.oficialPendingStreakCell
    expect(pending).not.toBeNull()

    // El grid a mostrar sigue teniendo como mucho 26 columnas (nunca crece),
    // y la celda pendiente cae en su última columna.
    expect(store.streakDisplayColumns.length).toBeLessThanOrEqual(26)
    expect(pending?.column).toBe(store.streakDisplayColumns.length - 1)

    // La última columna real (con datos reales, todavía sin la jugada nueva)
    // queda descartada en el grid a mostrar — nunca superpuesta: la columna
    // que ocupa esa posición ahora es la simulada (solo con la celda
    // pendiente y vacíos), no la última columna real original.
    expect(store.streakDisplayColumns[pending!.column]).not.toEqual(realLastColumn)
    expect(store.streakDisplayColumns[pending!.column]?.[pending!.row]).toBe('player')
  })

  it('hydrate reports per-domain errors without failing other domains', async () => {
    vi.mocked(endpoints.getReportsSummary).mockRejectedValueOnce(
      new ApiError({ code: 'UNAUTHORIZED', message: 'Unauthorized', httpStatus: 401 }),
    )

    const store = useBacboproStore()
    await store.hydrate()

    expect(store.summaryError).toBe('API key inválida o faltante')
    expect(store.summary).toBeNull()
    expect(store.history).toHaveLength(200)
    expect(store.oficial.config).toEqual(oficialConfig)
  })

  it('applyChannelPatch updates the channel config and returns true', async () => {
    vi.mocked(endpoints.patchChannel).mockResolvedValueOnce({
      data: { ...pruebasConfig, strategyId: 'streak-3' },
      requestId: 'r10',
    })
    const store = useBacboproStore()

    const ok = await store.applyChannelPatch('pruebas', { strategyId: 'streak-3' })

    expect(ok).toBe(true)
    expect(endpoints.patchChannel).toHaveBeenCalledWith('pruebas', { strategyId: 'streak-3' })
    expect(store.pruebas.config?.strategyId).toBe('streak-3')
    expect(store.pruebas.patchError).toBeNull()
    expect(store.pruebas.patching).toBe(false)
  })

  it('applyChannelPatch keeps channels independent on conflict', async () => {
    vi.mocked(endpoints.patchChannel).mockRejectedValueOnce(
      new ApiError({ code: 'CONFLICT', message: 'conflicto', httpStatus: 409 }),
    )
    const store = useBacboproStore()
    await store.hydrate()

    const ok = await store.applyChannelPatch('oficial', { strategyId: 'streak-3' })

    expect(ok).toBe(false)
    expect(store.oficial.patchError).toBe('El cambio choca con una operación activa')
    expect(store.oficial.config?.strategyId).toBe('streak-4')
    expect(store.pruebas.config?.strategyId).toBeNull()
    expect(store.pruebas.patchError).toBeNull()
  })

  it('cancelOperation replaces the operation with the CANCELLED view model', async () => {
    const store = useBacboproStore()
    await store.hydrate()

    const ok = await store.cancelOperation('oficial')

    expect(ok).toBe(true)
    expect(endpoints.cancelOperation).toHaveBeenCalledWith('op-streak-4')
    expect(store.oficial.operation?.currentState).toBe('CANCELLED')
    expect(store.oficial.cancelError).toBeNull()
  })

  it('cancelOperation clears the operation on NOT_FOUND', async () => {
    vi.mocked(endpoints.cancelOperation).mockRejectedValueOnce(
      new ApiError({ code: 'NOT_FOUND', message: 'No existe', httpStatus: 404 }),
    )
    const store = useBacboproStore()
    await store.hydrate()

    const ok = await store.cancelOperation('oficial')

    expect(ok).toBe(true)
    expect(store.oficial.operation).toBeNull()
    expect(store.oficial.cancelError).toBeNull()
  })

  it('cancelOperation surfaces other errors', async () => {
    vi.mocked(endpoints.cancelOperation).mockRejectedValueOnce(
      new ApiError({ code: 'INTERNAL', message: 'fallo interno', httpStatus: 500 }),
    )
    const store = useBacboproStore()
    await store.hydrate()

    const ok = await store.cancelOperation('oficial')

    expect(ok).toBe(false)
    expect(store.oficial.cancelError).toBe('fallo interno')
    expect(store.oficial.operation?.currentState).toBe('OPEN')
  })

  it('sendReport dispatches the report and reports errors', async () => {
    const store = useBacboproStore()

    await expect(store.sendReport()).resolves.toBe(true)
    expect(endpoints.postAdminReports).toHaveBeenCalled()

    vi.mocked(endpoints.postAdminReports).mockRejectedValueOnce(
      new ApiError({ code: 'UNAUTHORIZED', message: 'Unauthorized', httpStatus: 401 }),
    )
    await expect(store.sendReport()).resolves.toBe(false)
    expect(store.sendReportError).toBe('API key inválida o faltante')
  })

  it('connectStream opens the stream once and flags the connection', async () => {
    const store = useBacboproStore()
    await store.hydrate()

    await store.connectStream()
    await store.connectStream()

    expect(endpoints.openEventsStream).toHaveBeenCalledTimes(1)
    expect(store.streamConnected).toBe(true)
    expect(store.streamError).toBeNull()
  })

  it('routes operation events to the channel that owns the strategyId', async () => {
    const store = useBacboproStore()
    await store.hydrate()
    await store.connectStream()
    expect(streamHandlers).not.toBeNull()

    streamHandlers!.onOperation?.({
      type: 'operation.mg1',
      payload: operationOf('streak-4', { currentState: 'MG1', currentMartingale: 1 }),
      occurredAt: '2026-08-11T04:28:10.826Z',
    })

    expect(store.oficial.operation?.currentState).toBe('MG1')
    expect(store.pruebas.operation).toBeNull()
  })

  it('ignores operation events whose strategy is not assigned to any channel', async () => {
    const store = useBacboproStore()
    await store.hydrate()
    await store.connectStream()
    expect(streamHandlers).not.toBeNull()

    streamHandlers!.onOperation?.({
      type: 'operation.opened',
      payload: operationOf('streak-9'),
      occurredAt: '2026-08-11T04:28:10.826Z',
    })

    expect(store.oficial.operation?.strategyId).toBe('streak-4')
    expect(store.pruebas.operation).toBeNull()
  })

  it('appends game.received events and caps history at 200', async () => {
    const store = useBacboproStore()
    await store.hydrate()
    await store.connectStream()
    expect(streamHandlers).not.toBeNull()

    for (let i = 0; i < 3; i++) {
      streamHandlers!.onGameReceived?.({
        type: 'game.received',
        payload: {
          roundId: `live-${i}`,
          winner: 'BANKER',
          score: 9,
          playedAt: '2026-08-11T05:00:00.000Z',
        },
        occurredAt: '2026-08-11T05:00:00.000Z',
      })
    }

    expect(store.history).toHaveLength(200)
    expect(store.history[store.history.length - 1]?.roundId).toBe('live-2')
    expect(store.history[store.history.length - 2]?.roundId).toBe('live-1')
  })

  it('updates the rolling windows from stats.rolling events', async () => {
    const store = useBacboproStore()
    await store.hydrate()
    await store.connectStream()
    expect(streamHandlers).not.toBeNull()

    streamHandlers!.onStatsRolling?.({
      type: 'stats.rolling',
      payload: { window: 200, playerPct: 46, bankerPct: 43, tiePct: 11 },
      occurredAt: '2026-08-11T04:28:10.828Z',
    })
    streamHandlers!.onStatsRolling?.({
      type: 'stats.rolling',
      payload: { window: 50, playerPct: 40, bankerPct: 50, tiePct: 10 },
      occurredAt: '2026-08-11T04:28:10.828Z',
    })

    expect(store.rolling200?.playerPct).toBe(46)
    expect(store.rolling50?.bankerPct).toBe(50)
    const titles = store.statsBlocks.map((block) => block.title)
    expect(titles).toEqual(['ÚLTIMAS 200', 'ÚLTIMAS 50'])
  })

  it('marks the stream disconnected on stream errors', async () => {
    const store = useBacboproStore()
    await store.hydrate()
    await store.connectStream()
    expect(streamHandlers).not.toBeNull()

    streamHandlers!.onError?.(
      new ApiError({ code: 'NETWORK_ERROR', message: 'se cayó', httpStatus: null }),
    )

    expect(store.streamConnected).toBe(false)
    expect(store.streamError).toBe('No se pudo conectar con la API')
  })

  it('reports connection failures from openEventsStream', async () => {
    vi.mocked(endpoints.openEventsStream).mockRejectedValueOnce(
      new ApiError({ code: 'UNAUTHORIZED', message: 'Unauthorized', httpStatus: 401 }),
    )
    const store = useBacboproStore()
    await store.hydrate()

    await store.connectStream()

    expect(store.streamConnected).toBe(false)
    expect(store.streamError).toBe('API key inválida o faltante')
  })

  it('builds stats blocks from history before any rolling event arrives', async () => {
    const store = useBacboproStore()
    await store.hydrate()

    expect(store.rolling200).toBeNull()
    expect(store.statsBlocks.map((block) => block.title)).toEqual(['ÚLTIMAS 200', 'ÚLTIMAS 50'])
    expect(store.statsBlocks.every((block) => block.segments.length === 3)).toBe(true)
  })

  it('refreshSummary updates the summary and keeps KPIs from the oficial channel', async () => {
    const store = useBacboproStore()
    await store.hydrate()

    vi.mocked(endpoints.getReportsSummary).mockResolvedValueOnce({
      data: {
        uptimeMs: 9000000,
        oficial: { won: 12, lost: 1, alertsSent: 13 },
        pruebas: { won: 0, lost: 0, alertsSent: 0 },
      },
      requestId: 'r11',
    })
    await store.refreshSummary()

    expect(store.kpiItems).toEqual([
      { label: 'GANADAS', value: '12', tone: 'green' },
      { label: 'ALERTAS', value: '13', tone: 'yellow' },
      { label: 'PERDIDAS', value: '1', tone: 'red' },
      { label: 'TIEMPO', value: '02:30:00', tone: 'mono' },
    ])
  })

  it('dispose aborts the stream and clears the interval', async () => {
    const store = useBacboproStore()
    await store.hydrate()
    await store.connectStream()

    store.dispose()

    expect(abortSpy).toHaveBeenCalledTimes(1)
    expect(store.streamConnected).toBe(false)
  })
})
