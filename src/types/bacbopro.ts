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

export type OperationSide = 'player' | 'banker'

export interface OperationEntry {
  alertLabel: string
  game: string
  pattern: string
  entryAfterSide: OperationSide
  betOnSide: OperationSide
  maxMartingales: number
}
