import type {
  HistoryItem,
  OperationVm,
  ReportSummary,
  StatsRollingPayload,
  StrategyCatalogItem,
  Winner,
} from '@/api/types'
import type {
  EffectivenessStats,
  KpiItem,
  NonEmptyOutcome,
  OperationDisplayState,
  OperationEntry,
  OperationSide,
  Outcome,
  StatsBlock,
  StatsSegment,
  StrategyOption,
  StreakColumn,
} from '@/types/bacbopro'

export const STREAK_MAX_ROWS = 6
export const STREAK_VISIBLE_COLUMNS = 14
export const STREAK_HISTORY_WINDOW = 100
// El tablero de rachas nunca hace scroll lateral: siempre muestra como
// máximo estas columnas (las más recientes), con ancho fluido.
export const STREAK_DISPLAY_COLUMNS = 26
export const HISTORY_COLUMNS = 26
export const HISTORY_ROWS = 6
export const HISTORY_TOTAL = 200
// El tablero de últimas jugadas nunca usa las últimas 4 columnas: quedan
// siempre vacías como margen, para que nunca se vea forzosamente lleno.
// Con 26 columnas totales, la columna 22 es siempre la que se va llenando.
export const HISTORY_EMPTY_BUFFER_COLUMNS = 4
export const HISTORY_ACTIVE_COLUMNS = HISTORY_COLUMNS - HISTORY_EMPTY_BUFFER_COLUMNS

const OUTCOME_LABELS: Record<NonEmptyOutcome, string> = {
  player: 'PLAYER',
  tie: 'TIE',
  banker: 'BANKER',
}

export function winnerToOutcome(winner: Winner): NonEmptyOutcome {
  if (winner === 'PLAYER') return 'player'
  if (winner === 'BANKER') return 'banker'
  return 'tie'
}

export function historyToOutcomes(history: HistoryItem[]): NonEmptyOutcome[] {
  return history.map((item) => winnerToOutcome(item.winner))
}

export function buildStreakColumns(results: NonEmptyOutcome[], maxRows: number): StreakColumn[] {
  const columns: StreakColumn[] = []
  for (const outcome of results) {
    const last = columns[columns.length - 1]
    if (last && last.outcome === outcome && last.count < maxRows) {
      last.count += 1
    } else {
      columns.push({ outcome, count: 1 })
    }
  }
  return columns
}

export function buildVisibleStreakColumns(
  results: NonEmptyOutcome[],
  maxRows: number,
  historyWindow: number,
): StreakColumn[] {
  return buildStreakColumns(results.slice(-historyWindow), maxRows)
}

/**
 * Tablero de rachas estilo "Big Road": cada racha baja por una columna hasta
 * `maxRows`. Si la racha continúa más allá de eso, en vez de abrir una nueva
 * columna desde arriba, forma una "cola de dragón": sigue en la fila de
 * abajo, pero avanzando una columna a la derecha por cada jugada extra
 * (formando una "L"). Un resultado distinto siempre abre una columna nueva
 * desde la fila de arriba.
 */
export function buildBigRoadGrid(results: NonEmptyOutcome[], maxRows: number): Outcome[][] {
  let column = -1
  let row = 0
  let currentOutcome: NonEmptyOutcome | null = null
  let overflowing = false
  const placements: { row: number; column: number; outcome: NonEmptyOutcome }[] = []

  for (const outcome of results) {
    if (currentOutcome === null) {
      column = 0
      row = 0
      overflowing = false
    } else if (outcome === currentOutcome) {
      if (overflowing) {
        column += 1
      } else if (row < maxRows - 1) {
        row += 1
      } else {
        column += 1
        overflowing = true
      }
    } else {
      column += 1
      row = 0
      overflowing = false
    }
    currentOutcome = outcome
    placements.push({ row, column, outcome })
  }

  const totalColumns = column + 1
  const grid: Outcome[][] = Array.from({ length: maxRows }, () =>
    Array<Outcome>(totalColumns).fill('empty'),
  )
  for (const placement of placements) {
    const gridRow = grid[placement.row]
    if (gridRow) gridRow[placement.column] = placement.outcome
  }
  return grid
}

export interface BigRoadCursor {
  /** Columnas ya construidas, cada una de longitud fija `maxRows` (con 'empty' en los huecos). */
  columns: Outcome[][]
  row: number
  overflowing: boolean
  lastOutcome: NonEmptyOutcome | null
}

export function createEmptyBigRoadCursor(): BigRoadCursor {
  return { columns: [], row: 0, overflowing: false, lastOutcome: null }
}

/**
 * Versión incremental de `buildBigRoadGrid`: agrega UNA jugada al cursor ya
 * construido en vez de recalcular todo desde el historial completo. Así las
 * columnas cerradas nunca cambian de posición ni de contenido — solo la
 * columna activa crece, y el tablero "corre" (descartando la columna más
 * antigua) recién cuando se abre una nueva y se supera `maxColumns`. Esto
 * también es lo que permite fijar un número máximo de columnas sin
 * necesitar scroll lateral.
 */
export function appendOutcomeToBigRoad(
  cursor: BigRoadCursor,
  outcome: NonEmptyOutcome,
  maxRows: number,
  maxColumns: number,
): BigRoadCursor {
  const columns = cursor.columns.map((column) => [...column])
  let row = cursor.row
  let overflowing = cursor.overflowing

  if (cursor.lastOutcome === null) {
    columns.push(Array<Outcome>(maxRows).fill('empty'))
    row = 0
    overflowing = false
  } else if (outcome === cursor.lastOutcome) {
    if (overflowing) {
      columns.push(Array<Outcome>(maxRows).fill('empty'))
    } else if (row < maxRows - 1) {
      row += 1
    } else {
      columns.push(Array<Outcome>(maxRows).fill('empty'))
      overflowing = true
    }
  } else {
    columns.push(Array<Outcome>(maxRows).fill('empty'))
    row = 0
    overflowing = false
  }

  const activeColumn = columns[columns.length - 1]
  if (activeColumn) activeColumn[row] = outcome

  while (columns.length > maxColumns) columns.shift()

  return { columns, row, overflowing, lastOutcome: outcome }
}

/** Reconstruye el cursor del Big Road a partir de un historial ya cargado. */
export function buildStableBigRoadColumns(
  results: NonEmptyOutcome[],
  maxRows: number,
  maxColumns: number,
): BigRoadCursor {
  let cursor = createEmptyBigRoadCursor()
  for (const outcome of results) {
    cursor = appendOutcomeToBigRoad(cursor, outcome, maxRows, maxColumns)
  }
  return cursor
}

export function buildHistoryGrid(results: Outcome[], columns: number, rows: number): Outcome[][] {
  const visible = results.slice(-(columns * rows))
  const grid: Outcome[][] = []
  for (let row = 0; row < rows; row++) {
    const cells: Outcome[] = []
    for (let column = 0; column < columns; column++) {
      cells.push(visible[column * rows + row] ?? 'empty')
    }
    grid.push(cells)
  }
  return grid
}

/**
 * Añade una jugada a la última columna en construcción. Cuando esa columna
 * llega a `rows` jugadas queda "cerrada" y la siguiente jugada abre una
 * columna nueva. Así las columnas ya cerradas nunca se recalculan ni se
 * desplazan jugada a jugada — solo la última columna cambia, y el tablero
 * "corre" (se descarta la columna más antigua) recién cuando se cierra una.
 */
export function appendOutcomeToColumns(
  columns: NonEmptyOutcome[][],
  outcome: NonEmptyOutcome,
  rows: number,
  maxColumns: number,
): NonEmptyOutcome[][] {
  const next = columns.map((column) => [...column])
  const last = next[next.length - 1]
  if (last && last.length < rows) {
    last.push(outcome)
  } else {
    next.push([outcome])
  }
  while (next.length > maxColumns) next.shift()
  return next
}

/** Reconstruye el estado de columnas estables a partir de un historial ya cargado. */
export function buildStableHistoryColumns(
  results: NonEmptyOutcome[],
  rows: number,
  maxColumns: number,
): NonEmptyOutcome[][] {
  let columns: NonEmptyOutcome[][] = []
  for (const outcome of results) {
    columns = appendOutcomeToColumns(columns, outcome, rows, maxColumns)
  }
  return columns
}

/** Convierte las columnas estables (con la última posiblemente incompleta) en la
 * cuadrícula fila x columna que consume la UI, rellenando el resto con 'empty'. */
export function renderHistoryColumnsGrid(
  columns: NonEmptyOutcome[][],
  rows: number,
  displayColumns: number,
): Outcome[][] {
  const grid: Outcome[][] = []
  for (let row = 0; row < rows; row++) {
    const cells: Outcome[] = []
    for (let column = 0; column < displayColumns; column++) {
      cells.push(columns[column]?.[row] ?? 'empty')
    }
    grid.push(cells)
  }
  return grid
}

export type StreakLengthFilter = 3 | 4 | 5 | 'L'

export interface RunInfo {
  /** Longitud total de la racha (de resultados consecutivos iguales) a la
   * que pertenece esta posición — puede seguir más allá de esta posición. */
  length: number
  /** Posición (0-indexada) de esta celda dentro de su racha, contada SIEMPRE
   * desde el primer resultado distinto al anterior (el inicio real de la
   * racha) — una racha larga nunca se "reinicia" a la mitad. */
  offset: number
}

/** Racha (de resultados consecutivos iguales) a la que pertenece cada
 * posición de `outcomes`, alineada índice a índice con el propio array. Un
 * TIE corta cualquier racha de player/banker en curso, igual que en el
 * tablero de rachas (Big Road). */
export function computeRunInfo(outcomes: NonEmptyOutcome[]): RunInfo[] {
  const infos: RunInfo[] = Array.from({ length: outcomes.length })
  let i = 0
  while (i < outcomes.length) {
    let j = i
    while (j < outcomes.length && outcomes[j] === outcomes[i]) j++
    const runLength = j - i
    for (let k = i; k < j; k++) infos[k] = { length: runLength, offset: k - i }
    i = j
  }
  return infos
}

/** Longitud de la racha a la que pertenece cada posición (ver `computeRunInfo`). */
export function computeRunLengths(outcomes: NonEmptyOutcome[]): number[] {
  return computeRunInfo(outcomes).map((info) => info.length)
}

/** 3/4/5 marcan las PRIMERAS 3/4/5 fichas de cualquier racha que llegue al
 * menos a esa longitud (así siga más allá — una racha de 7 con el filtro 3
 * marca solo sus 3 primeras fichas). "L" marca la racha COMPLETA en cuanto
 * llega a 6 o más (la misma "cola de dragón" del Big Road). */
export function matchesStreakLengthFilter(runInfo: RunInfo, filter: StreakLengthFilter): boolean {
  if (filter === 'L') return runInfo.length >= 6
  return runInfo.length >= filter && runInfo.offset < filter
}

/** Para cada posición de `outcomes`, indica si pertenece a una racha de
 * player o banker (nunca tie) que coincide con `filter` (ver `matchesStreakLengthFilter`). */
export function buildStreakLengthFlags(
  outcomes: NonEmptyOutcome[],
  filter: StreakLengthFilter,
): boolean[] {
  const runInfos = computeRunInfo(outcomes)
  return outcomes.map((outcome, index) => {
    const info = runInfos[index]
    return outcome !== 'tie' && info !== undefined && matchesStreakLengthFilter(info, filter)
  })
}

/** Proyecta un array de valores (alineado índice a índice con `outcomes`,
 * en el mismo orden cronológico) sobre la cuadrícula visible del tablero de
 * últimas jugadas, con el mismo "chunking" de columnas estables (rellena la
 * columna activa hasta HISTORY_ROWS antes de abrir una nueva, y descarta solo
 * la columna más vieja al superar HISTORY_ACTIVE_COLUMNS) que ya usa
 * `buildStableHistoryColumns`/`renderHistoryColumnsGrid` — así el resultado
 * queda siempre alineado celda a celda con `historyGrid`. */
export function projectToHistoryGrid<T>(
  outcomes: NonEmptyOutcome[],
  values: readonly T[],
  emptyValue: T,
): T[][] {
  const columns: T[][] = []
  for (let i = 0; i < outcomes.length; i++) {
    const value = values[i] ?? emptyValue
    const last = columns[columns.length - 1]
    if (last && last.length < HISTORY_ROWS) {
      last.push(value)
    } else {
      columns.push([value])
    }
    if (columns.length > HISTORY_ACTIVE_COLUMNS) columns.shift()
  }

  const grid: T[][] = []
  for (let row = 0; row < HISTORY_ROWS; row++) {
    const cells: T[] = []
    for (let column = 0; column < HISTORY_COLUMNS; column++) {
      cells.push(columns[column]?.[row] ?? emptyValue)
    }
    grid.push(cells)
  }
  return grid
}

export function buildStatsBlock(results: NonEmptyOutcome[], title: string): StatsBlock {
  if (results.length === 0) {
    return { title, segments: [] }
  }
  const total = results.length
  const counts: Record<NonEmptyOutcome, number> = { player: 0, tie: 0, banker: 0 }
  for (const outcome of results) {
    counts[outcome] += 1
  }
  const player = Math.round((counts.player / total) * 100)
  const tie = Math.round((counts.tie / total) * 100)
  const segments: StatsSegment[] = [
    { label: OUTCOME_LABELS.player, outcome: 'player', percentage: player },
    { label: OUTCOME_LABELS.tie, outcome: 'tie', percentage: tie },
    {
      label: OUTCOME_LABELS.banker,
      outcome: 'banker',
      percentage: Math.max(0, 100 - player - tie),
    },
  ]
  return { title, segments }
}

export function rollingToStatsBlock(rolling: StatsRollingPayload, title: string): StatsBlock {
  return {
    title,
    segments: [
      { label: OUTCOME_LABELS.player, outcome: 'player', percentage: rolling.playerPct },
      { label: OUTCOME_LABELS.tie, outcome: 'tie', percentage: rolling.tiePct },
      { label: OUTCOME_LABELS.banker, outcome: 'banker', percentage: rolling.bankerPct },
    ],
  }
}

export function summaryToKpiItems(summary: ReportSummary, liveUptimeMs: number): KpiItem[] {
  return [
    { label: 'GANADAS', value: String(summary.oficial.won), tone: 'green' },
    { label: 'ALERTAS', value: String(summary.oficial.alertsSent), tone: 'yellow' },
    { label: 'PERDIDAS', value: String(summary.oficial.lost), tone: 'red' },
    { label: 'TIEMPO', value: formatUptime(liveUptimeMs), tone: 'mono' },
  ]
}

/** Efectividad real observada (canal oficial), derivada de `ReportSummary`. */
export function summaryToEffectivenessStats(summary: ReportSummary): EffectivenessStats {
  const won = summary.oficial.won
  const lost = summary.oficial.lost
  const totalOperations = won + lost
  const effectivenessPct = totalOperations > 0 ? (won / totalOperations) * 100 : 0
  return { totalOperations, wonOperations: won, lostOperations: lost, effectivenessPct }
}

export function formatUptime(uptimeMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(uptimeMs / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const pad = (value: number): string => String(value).padStart(2, '0')
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

export function winnerToSide(winner: Winner): OperationSide {
  if (winner === 'PLAYER') return 'player'
  if (winner === 'BANKER') return 'banker'
  return 'tie'
}

const OPERATION_ALERT_LABELS: Record<OperationDisplayState, string> = {
  OPEN: 'NUEVA ENTRADA',
  MG1: 'MARTINGALA 1',
  MG2: 'MARTINGALA 2',
  WON: 'OPERACIÓN GANADA',
  LOST: 'OPERACIÓN PERDIDA',
  CANCELLED: 'OPERACIÓN CANCELADA',
}

export function operationToEntry(operation: OperationVm, maxMartingales: number): OperationEntry {
  const safeMaxMartingales = Math.min(Math.max(maxMartingales, 0), 2)
  return {
    alertLabel: OPERATION_ALERT_LABELS[operation.currentState],
    strategyId: operation.strategyId,
    pattern: operation.reason,
    entryAfterSide: winnerToSide(operation.streakWinner),
    betOnSide: winnerToSide(operation.recommendedWinner),
    maxMartingales: safeMaxMartingales,
    state: operation.currentState,
  }
}

export function strategyToOption(strategy: StrategyCatalogItem): StrategyOption {
  return { id: strategy.id, label: strategy.id }
}
