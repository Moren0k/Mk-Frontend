export type Outcome = 'player' | 'banker' | 'tie' | 'empty'

export type StreakCellState = Outcome

export type NonEmptyOutcome = Exclude<Outcome, 'empty'>

export type WinnerOutcome = NonEmptyOutcome

export interface StreakColumn {
  outcome: NonEmptyOutcome
  count: number
}

export type KpiTone = 'yellow' | 'red' | 'green' | 'mono'

export interface KpiItem {
  label: string
  value: string
  tone: KpiTone
}

export interface StatsSegment {
  label: string
  percentage: number
  outcome: Exclude<Outcome, 'empty'>
}

export interface StatsBlock {
  title: string
  segments: StatsSegment[]
}

export interface StrategyOption {
  id: string
  label: string
}

export type OperationSide = 'player' | 'banker' | 'tie'

/** Posición (fila/columna, misma convención que los grids de los tableros)
 * donde caería la PRÓXIMA jugada, mientras una alerta del canal oficial
 * sigue abierta esperando su resultado. */
export interface PendingAlertCell {
  row: number
  column: number
  side: Exclude<OperationSide, 'tie'>
}

export type OperationDisplayState = 'OPEN' | 'MG1' | 'MG2' | 'WON' | 'LOST' | 'CANCELLED'

export interface OperationEntry {
  alertLabel: string
  strategyId: string
  pattern: string
  entryAfterSide: OperationSide
  betOnSide: OperationSide
  maxMartingales: number
  state: OperationDisplayState
}

/** Estadísticas reales del canal oficial, derivadas de `ReportSummary` (GET /reports/summary). */
export interface EffectivenessStats {
  totalOperations: number
  wonOperations: number
  lostOperations: number
  effectivenessPct: number
}
