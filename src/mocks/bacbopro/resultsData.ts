import type { NonEmptyOutcome, Outcome, StreakColumn } from '@/types/bacbopro'
import { createSeededOutcomes } from './outcomeGenerator'
import {
  HISTORY_COLUMNS,
  HISTORY_ROWS,
  HISTORY_TOTAL,
  STREAK_MAX_ROWS,
  STREAK_VISIBLE_COLUMNS,
  buildHistoryGrid,
  buildStreakColumns,
} from '@/mappers/bacboproMapper'

export {
  HISTORY_COLUMNS,
  HISTORY_ROWS,
  HISTORY_TOTAL,
  STREAK_MAX_ROWS,
  STREAK_VISIBLE_COLUMNS,
  buildStreakColumns,
}

const DEMO_TAIL: NonEmptyOutcome[] = [
  'banker',
  'banker',
  'banker',
  'banker',
  'player',
  'player',
  'player',
  'tie',
  'tie',
  'banker',
  'banker',
  'banker',
  'banker',
  'banker',
  'banker',
  'banker',
]

const generated = createSeededOutcomes({
  seed: 7413002,
  count: HISTORY_TOTAL,
}) as NonEmptyOutcome[]

generated[HISTORY_TOTAL - DEMO_TAIL.length - 1] = 'player'

export const mockResults: NonEmptyOutcome[] = [
  ...generated.slice(0, HISTORY_TOTAL - DEMO_TAIL.length),
  ...DEMO_TAIL,
]

export const streakColumns: StreakColumn[] = buildStreakColumns(
  mockResults,
  STREAK_MAX_ROWS,
).slice(-STREAK_VISIBLE_COLUMNS)

export const historyGrid: Outcome[][] = buildHistoryGrid(
  mockResults,
  HISTORY_COLUMNS,
  HISTORY_ROWS,
)
