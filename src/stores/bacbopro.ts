import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type {
  ChannelId,
  ChannelState,
  GameReceivedPayload,
  HealthData,
  HistoryItem,
  OperationEvent,
  OperationVm,
  PatchChannelBody,
  ReportSummary,
  StatsRollingPayload,
  StrategyCatalogItem,
} from '@/api/types'
import { ApiError } from '@/api/client'
import {
  cancelOperation as cancelOperationRequest,
  getChannel,
  getHealth,
  getHistory,
  getOperations,
  getReportsSummary,
  getStrategies,
  openEventsStream,
  patchChannel,
  postAdminReports,
} from '@/api/endpoints'
import {
  HISTORY_ACTIVE_COLUMNS,
  HISTORY_COLUMNS,
  HISTORY_ROWS,
  STREAK_DISPLAY_COLUMNS,
  STREAK_MAX_ROWS,
  appendOutcomeToBigRoad,
  appendOutcomeToColumns,
  buildStableBigRoadColumns,
  buildStableHistoryColumns,
  buildStatsBlock,
  createEmptyBigRoadCursor,
  historyToOutcomes,
  operationToEntry,
  renderHistoryColumnsGrid,
  rollingToStatsBlock,
  strategyToOption,
  summaryToKpiItems,
  winnerToOutcome,
} from '@/mappers/bacboproMapper'
import type { BigRoadCursor } from '@/mappers/bacboproMapper'
import type {
  KpiItem,
  NonEmptyOutcome,
  OperationEntry,
  OperationSide,
  Outcome,
  PendingAlertCell,
  StatsBlock,
  StrategyOption,
} from '@/types/bacbopro'

// Estados en los que una operación sigue "esperando" su jugada: mismo
// criterio que usa OperationCard para permitir cancelar.
const ALERT_ACTIVE_STATES = new Set(['OPEN', 'MG1', 'MG2'])

export const SUMMARY_REFRESH_INTERVAL_MS = 60_000

interface ChannelSnapshot {
  config: ChannelState | null
  operation: OperationVm | null
  loading: boolean
  error: string | null
  patching: boolean
  patchError: string | null
  cancelling: boolean
  cancelError: string | null
}

function createChannelSnapshot(): ChannelSnapshot {
  return {
    config: null,
    operation: null,
    loading: false,
    error: null,
    patching: false,
    patchError: null,
    cancelling: false,
    cancelError: null,
  }
}

export function describeApiError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'UNAUTHORIZED') return 'API key inválida o faltante'
    if (error.code === 'NETWORK_ERROR') return 'No se pudo conectar con la API'
    if (error.code === 'CONFLICT') return 'El cambio choca con una operación activa'
    return error.message
  }
  if (error instanceof Error) return error.message
  return 'Error desconocido'
}

export const useBacboproStore = defineStore('bacbopro', () => {
  const oficial = ref<ChannelSnapshot>(createChannelSnapshot())
  const pruebas = ref<ChannelSnapshot>(createChannelSnapshot())

  const history = ref<HistoryItem[]>([])
  const historyLoading = ref(false)
  const historyError = ref<string | null>(null)
  const historyColumns = ref<NonEmptyOutcome[][]>([])
  const bigRoadCursor = ref<BigRoadCursor>(createEmptyBigRoadCursor())

  const rolling200 = ref<StatsRollingPayload | null>(null)
  const rolling50 = ref<StatsRollingPayload | null>(null)

  const summary = ref<ReportSummary | null>(null)
  const summaryLoading = ref(false)
  const summaryError = ref<string | null>(null)

  // El "tiempo" corre localmente entre una petición y otra: se sincroniza con
  // el valor real del servidor cada vez que llega una respuesta nueva, y de
  // ahí en adelante avanza solo (un tick por segundo) hasta la próxima.
  const uptimeBaseMs = ref(0)
  const uptimeBaseAt = ref(Date.now())
  const uptimeTick = ref(0)

  const strategies = ref<StrategyCatalogItem[]>([])
  const strategiesLoading = ref(false)
  const strategiesError = ref<string | null>(null)

  const health = ref<HealthData | null>(null)
  const healthLoading = ref(false)
  const healthError = ref<string | null>(null)

  const streamConnected = ref(false)
  const streamConnecting = ref(false)
  const streamError = ref<string | null>(null)

  const sendingReport = ref(false)
  const sendReportError = ref<string | null>(null)

  const hydrated = ref(false)

  let initialized = false
  let streamController: { abort: () => void } | null = null
  let summaryTimer: ReturnType<typeof setInterval> | null = null
  let uptimeTimer: ReturnType<typeof setInterval> | null = null

  function syncUptime(uptimeMs: number): void {
    uptimeBaseMs.value = uptimeMs
    uptimeBaseAt.value = Date.now()
  }

  const channelSnapshot = (channel: ChannelId): ChannelSnapshot =>
    channel === 'oficial' ? oficial.value : pruebas.value

  const historyOutcomes = computed<NonEmptyOutcome[]>(() => historyToOutcomes(history.value))

  // Columnas del tablero de rachas (Big Road), column-major (columns[col][row]),
  // ya acotadas a STREAK_DISPLAY_COLUMNS — nunca necesita scroll lateral.
  const streakColumns = computed<Outcome[][]>(() => bigRoadCursor.value.columns)

  const historyGrid = computed<Outcome[][]>(() =>
    renderHistoryColumnsGrid(historyColumns.value, HISTORY_ROWS, HISTORY_COLUMNS),
  )

  const lastWinner = computed<NonEmptyOutcome | null>(() => {
    const outcomes = historyOutcomes.value
    return outcomes.length > 0 ? (outcomes[outcomes.length - 1] ?? null) : null
  })

  const statsBlocks = computed<StatsBlock[]>(() => {
    const blocks: StatsBlock[] = []
    if (rolling200.value) {
      blocks.push(rollingToStatsBlock(rolling200.value, 'ÚLTIMAS 200'))
    } else if (historyOutcomes.value.length > 0) {
      blocks.push(buildStatsBlock(historyOutcomes.value.slice(-200), 'ÚLTIMAS 200'))
    }
    if (rolling50.value) {
      blocks.push(rollingToStatsBlock(rolling50.value, 'ÚLTIMAS 50'))
    } else if (historyOutcomes.value.length > 0) {
      blocks.push(buildStatsBlock(historyOutcomes.value.slice(-50), 'ÚLTIMAS 50'))
    }
    return blocks
  })

  const displayUptimeMs = computed<number>(() => {
    void uptimeTick.value // dependencia reactiva: fuerza recálculo cada segundo
    return uptimeBaseMs.value + (Date.now() - uptimeBaseAt.value)
  })

  const kpiItems = computed<KpiItem[]>(() =>
    summary.value ? summaryToKpiItems(summary.value, displayUptimeMs.value) : [],
  )

  const strategyOptions = computed<StrategyOption[]>(() =>
    strategies.value.map(strategyToOption),
  )

  function maxMartingalesFor(channel: ChannelId): number {
    const config = channelSnapshot(channel).config
    return config?.maxMartingalesOverride ?? 2
  }

  function operationEntryFor(channel: ChannelId): OperationEntry | null {
    const snapshot = channelSnapshot(channel)
    if (!snapshot.operation) return null
    return operationToEntry(snapshot.operation, maxMartingalesFor(channel))
  }

  const oficialOperation = computed<OperationEntry | null>(() => operationEntryFor('oficial'))
  const pruebasOperation = computed<OperationEntry | null>(() => operationEntryFor('pruebas'))

  // Lado al que hay que apostar según la alerta activa del canal OFICIAL
  // (nunca "pruebas"): se muestra como bolita intermitente en ambos
  // tableros mientras la operación sigue esperando su jugada. Se mantiene
  // igual durante MG1/MG2 (aunque lleguen ties u otros resultados
  // intermedios) y desaparece recién cuando la operación cierra con un
  // estado (WON/LOST/CANCELLED).
  const oficialAlertSide = computed<Exclude<OperationSide, 'tie'> | null>(() => {
    const operation = oficialOperation.value
    if (!operation || !ALERT_ACTIVE_STATES.has(operation.state)) return null
    return operation.betOnSide === 'tie' ? null : operation.betOnSide
  })

  // Dónde caería esa próxima jugada en cada tablero: se SIMULA (sin tocar
  // el estado real) agregando `oficialAlertSide` al cursor/columnas
  // vigentes, con las mismas funciones puras que ya usa el resto del
  // tablero — así la celda "pendiente" queda exactamente donde caería la
  // jugada real si llegara ahora mismo.
  //
  // El tablero de últimas jugadas usa HISTORY_COLUMNS (no HISTORY_ACTIVE_COLUMNS)
  // como tope para la simulación a propósito: como HISTORY_COLUMNS ya deja
  // HISTORY_EMPTY_BUFFER_COLUMNS columnas siempre vacías al final, la celda
  // simulada cae ahí sin desplazar ninguna columna con datos reales.
  const oficialPendingHistoryCell = computed<PendingAlertCell | null>(() => {
    const side = oficialAlertSide.value
    if (!side) return null
    const simulated = appendOutcomeToColumns(historyColumns.value, side, HISTORY_ROWS, HISTORY_COLUMNS)
    const column = simulated.length - 1
    const activeColumn = simulated[column]
    if (!activeColumn) return null
    return { row: activeColumn.length - 1, column, side }
  })

  // El tablero de rachas, en cambio, NO tiene columnas de margen: sus
  // STREAK_DISPLAY_COLUMNS están siempre activas. Si simuláramos con ese
  // mismo tope estando el tablero lleno, la simulación descartaría (shift)
  // la columna más vieja para abrir la nueva — pero el grid REAL que ya
  // está en pantalla no hizo ese descarte, así que la celda pendiente
  // quedaría superpuesta sobre la última columna real en vez de ir después.
  // Por eso el tablero se dibuja siempre a partir de las columnas YA
  // simuladas (con el mismo shift aplicado, si hizo falta) en vez de mezclar
  // el cursor real con una celda aislada calculada aparte.
  const oficialPendingStreakSimulation = computed(() => {
    const side = oficialAlertSide.value
    if (!side) return null
    const simulated = appendOutcomeToBigRoad(
      bigRoadCursor.value,
      side,
      STREAK_MAX_ROWS,
      STREAK_DISPLAY_COLUMNS,
    )
    const column = simulated.columns.length - 1
    if (column < 0) return null
    return { columns: simulated.columns, row: simulated.row, column, side }
  })

  const streakDisplayColumns = computed<Outcome[][]>(
    () => oficialPendingStreakSimulation.value?.columns ?? bigRoadCursor.value.columns,
  )

  const oficialPendingStreakCell = computed<PendingAlertCell | null>(() => {
    const sim = oficialPendingStreakSimulation.value
    if (!sim) return null
    return { row: sim.row, column: sim.column, side: sim.side }
  })

  async function hydrate(): Promise<void> {
    oficial.value.loading = true
    pruebas.value.loading = true
    historyLoading.value = true
    summaryLoading.value = true
    strategiesLoading.value = true
    healthLoading.value = true

    const tasks: Promise<void>[] = [
      (async () => {
        try {
          const [configResponse, operationsResponse] = await Promise.all([
            getChannel('oficial'),
            getOperations('oficial'),
          ])
          oficial.value.config = configResponse.data
          oficial.value.operation = operationsResponse.data[0] ?? null
          oficial.value.error = null
        } catch (error) {
          oficial.value.error = describeApiError(error)
        } finally {
          oficial.value.loading = false
        }
      })(),
      (async () => {
        try {
          const [configResponse, operationsResponse] = await Promise.all([
            getChannel('pruebas'),
            getOperations('pruebas'),
          ])
          pruebas.value.config = configResponse.data
          pruebas.value.operation = operationsResponse.data[0] ?? null
          pruebas.value.error = null
        } catch (error) {
          pruebas.value.error = describeApiError(error)
        } finally {
          pruebas.value.loading = false
        }
      })(),
      (async () => {
        try {
          const response = await getHistory(200)
          history.value = response.data
          const outcomes = historyToOutcomes(response.data)
          historyColumns.value = buildStableHistoryColumns(
            outcomes,
            HISTORY_ROWS,
            HISTORY_ACTIVE_COLUMNS,
          )
          bigRoadCursor.value = buildStableBigRoadColumns(
            outcomes,
            STREAK_MAX_ROWS,
            STREAK_DISPLAY_COLUMNS,
          )
          historyError.value = null
        } catch (error) {
          historyError.value = describeApiError(error)
        } finally {
          historyLoading.value = false
        }
      })(),
      (async () => {
        try {
          const response = await getReportsSummary()
          summary.value = response.data
          syncUptime(response.data.uptimeMs)
          summaryError.value = null
        } catch (error) {
          summaryError.value = describeApiError(error)
        } finally {
          summaryLoading.value = false
        }
      })(),
      (async () => {
        try {
          const response = await getStrategies()
          strategies.value = response.data
          strategiesError.value = null
        } catch (error) {
          strategiesError.value = describeApiError(error)
        } finally {
          strategiesLoading.value = false
        }
      })(),
      (async () => {
        try {
          const response = await getHealth()
          health.value = response.data
          healthError.value = null
        } catch (error) {
          healthError.value = describeApiError(error)
        } finally {
          healthLoading.value = false
        }
      })(),
    ]

    await Promise.all(tasks)
  }

  function appendGame(game: GameReceivedPayload): void {
    const next = [...history.value, game]
    history.value = next.length > 200 ? next.slice(next.length - 200) : next
    const outcome = winnerToOutcome(game.winner)
    historyColumns.value = appendOutcomeToColumns(
      historyColumns.value,
      outcome,
      HISTORY_ROWS,
      HISTORY_ACTIVE_COLUMNS,
    )
    bigRoadCursor.value = appendOutcomeToBigRoad(
      bigRoadCursor.value,
      outcome,
      STREAK_MAX_ROWS,
      STREAK_DISPLAY_COLUMNS,
    )
  }

  function channelForStrategy(strategyId: string): ChannelId | null {
    if (oficial.value.config?.strategyId === strategyId) return 'oficial'
    if (pruebas.value.config?.strategyId === strategyId) return 'pruebas'
    return null
  }

  function handleOperationEvent(event: OperationEvent): void {
    const channel = channelForStrategy(event.payload.strategyId)
    if (!channel) return
    channelSnapshot(channel).operation = event.payload
  }

  async function connectStream(): Promise<void> {
    if (streamController || streamConnecting.value) return
    streamConnecting.value = true
    streamError.value = null

    try {
      streamController = await openEventsStream({
        onGameReceived: (event) => appendGame(event.payload),
        onStatsRolling: (event) => {
          if (event.payload.window === 200) {
            rolling200.value = event.payload
          } else {
            rolling50.value = event.payload
          }
        },
        onOperation: handleOperationEvent,
        onError: (error) => {
          streamConnected.value = false
          streamError.value = describeApiError(error)
        },
      })
      streamConnected.value = true
      streamError.value = null

      if (!summaryTimer) {
        summaryTimer = setInterval(() => {
          void refreshSummary()
        }, SUMMARY_REFRESH_INTERVAL_MS)
      }
    } catch (error) {
      streamConnected.value = false
      streamError.value = describeApiError(error)
    } finally {
      streamConnecting.value = false
    }
  }

  async function applyChannelPatch(channel: ChannelId, body: PatchChannelBody): Promise<boolean> {
    const snapshot = channelSnapshot(channel)
    snapshot.patching = true
    snapshot.patchError = null
    try {
      const response = await patchChannel(channel, body)
      snapshot.config = response.data
      return true
    } catch (error) {
      snapshot.patchError = describeApiError(error)
      return false
    } finally {
      snapshot.patching = false
    }
  }

  async function cancelOperation(channel: ChannelId): Promise<boolean> {
    const snapshot = channelSnapshot(channel)
    const operation = snapshot.operation
    if (!operation) return false

    snapshot.cancelling = true
    snapshot.cancelError = null
    try {
      const response = await cancelOperationRequest(operation.operationId)
      snapshot.operation = response.data
      return true
    } catch (error) {
      if (error instanceof ApiError && error.code === 'NOT_FOUND') {
        snapshot.operation = null
        return true
      }
      snapshot.cancelError = describeApiError(error)
      return false
    } finally {
      snapshot.cancelling = false
    }
  }

  async function refreshSummary(): Promise<void> {
    summaryLoading.value = true
    try {
      const response = await getReportsSummary()
      summary.value = response.data
      syncUptime(response.data.uptimeMs)
      summaryError.value = null
    } catch (error) {
      summaryError.value = describeApiError(error)
    } finally {
      summaryLoading.value = false
    }
  }

  async function refreshHealth(): Promise<void> {
    healthLoading.value = true
    try {
      const response = await getHealth()
      health.value = response.data
      healthError.value = null
    } catch (error) {
      healthError.value = describeApiError(error)
    } finally {
      healthLoading.value = false
    }
  }

  async function sendReport(): Promise<boolean> {
    sendingReport.value = true
    sendReportError.value = null
    try {
      await postAdminReports()
      return true
    } catch (error) {
      sendReportError.value = describeApiError(error)
      return false
    } finally {
      sendingReport.value = false
    }
  }

  function clearPatchError(channel: ChannelId): void {
    channelSnapshot(channel).patchError = null
  }

  function clearCancelError(channel: ChannelId): void {
    channelSnapshot(channel).cancelError = null
  }

  function clearSummaryError(): void {
    summaryError.value = null
  }

  function clearSendReportError(): void {
    sendReportError.value = null
  }

  async function initialize(): Promise<void> {
    if (initialized) return
    initialized = true
    if (!uptimeTimer) {
      uptimeTimer = setInterval(() => {
        uptimeTick.value += 1
      }, 1000)
    }
    await hydrate()
    hydrated.value = true
    await connectStream()
  }

  function dispose(): void {
    if (summaryTimer) {
      clearInterval(summaryTimer)
      summaryTimer = null
    }
    if (uptimeTimer) {
      clearInterval(uptimeTimer)
      uptimeTimer = null
    }
    if (streamController) {
      streamController.abort()
      streamController = null
    }
    streamConnected.value = false
    initialized = false
    hydrated.value = false
  }

  return {
    oficial,
    pruebas,
    history,
    historyLoading,
    historyError,
    historyColumns,
    rolling200,
    rolling50,
    summary,
    summaryLoading,
    summaryError,
    strategies,
    strategiesLoading,
    strategiesError,
    health,
    healthLoading,
    healthError,
    streamConnected,
    streamConnecting,
    streamError,
    sendingReport,
    sendReportError,
    hydrated,
    historyOutcomes,
    streakColumns,
    streakDisplayColumns,
    historyGrid,
    lastWinner,
    statsBlocks,
    kpiItems,
    strategyOptions,
    oficialOperation,
    pruebasOperation,
    oficialAlertSide,
    oficialPendingHistoryCell,
    oficialPendingStreakCell,
    initialize,
    hydrate,
    connectStream,
    applyChannelPatch,
    cancelOperation,
    refreshSummary,
    refreshHealth,
    sendReport,
    clearPatchError,
    clearCancelError,
    clearSummaryError,
    clearSendReportError,
    dispose,
  }
})
