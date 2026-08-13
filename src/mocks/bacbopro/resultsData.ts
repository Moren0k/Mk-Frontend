import type { NonEmptyOutcome, Outcome, StreakColumn } from '@/types/bacbopro'
import { createSeededOutcomes } from './outcomeGenerator'

export const STREAK_MAX_ROWS = 6
export const STREAK_VISIBLE_COLUMNS = 14
export const HISTORY_COLUMNS = 16
export const HISTORY_ROWS = 10
export const HISTORY_TOTAL = 200

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

export const streakColumns: StreakColumn[] = buildStreakColumns(
  mockResults,
  STREAK_MAX_ROWS,
).slice(-STREAK_VISIBLE_COLUMNS)

export const historyGrid: Outcome[][] = (() => {
  const visible = mockResults.slice(-(HISTORY_COLUMNS * HISTORY_ROWS))
  const grid: Outcome[][] = []
  for (let row = 0; row < HISTORY_ROWS; row++) {
    const cells: Outcome[] = []
    for (let column = 0; column < HISTORY_COLUMNS; column++) {
      cells.push(visible[column * HISTORY_ROWS + row] ?? 'empty')
    }
    grid.push(cells)
  }
  return grid
})()
