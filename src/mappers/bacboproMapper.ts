import type {
  HistoryItem,
  OperationVm,
  ReportSummary,
  StatsRollingPayload,
  StrategyCatalogItem,
  Winner,
} from '@/api/types'
import type {
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
export const HISTORY_COLUMNS = 16
export const HISTORY_ROWS = 10
export const HISTORY_TOTAL = 200

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

export function buildStreakColumns(
  results: NonEmptyOutcome[],
  maxRows: number,
): StreakColumn[] {
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
  visibleColumns: number,
): StreakColumn[] {
  return buildStreakColumns(results, maxRows).slice(-visibleColumns)
}

export function buildHistoryGrid(
  results: Outcome[],
  columns: number,
  rows: number,
): Outcome[][] {
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

export function rollingToStatsBlock(
  rolling: StatsRollingPayload,
  title: string,
): StatsBlock {
  return {
    title,
    segments: [
      { label: OUTCOME_LABELS.player, outcome: 'player', percentage: rolling.playerPct },
      { label: OUTCOME_LABELS.tie, outcome: 'tie', percentage: rolling.tiePct },
      { label: OUTCOME_LABELS.banker, outcome: 'banker', percentage: rolling.bankerPct },
    ],
  }
}

export function summaryToKpiItems(summary: ReportSummary): KpiItem[] {
  return [
    { label: 'WINS', value: String(summary.oficial.won), tone: 'green' },
    { label: 'ALERTAS ENVIADAS', value: String(summary.oficial.alertsSent), tone: 'yellow' },
    { label: 'LOST', value: String(summary.oficial.lost), tone: 'red' },
    { label: 'TIEMPO', value: formatUptime(summary.uptimeMs), tone: 'mono' },
  ]
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

export function operationToEntry(
  operation: OperationVm,
  maxMartingales: number,
): OperationEntry {
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
