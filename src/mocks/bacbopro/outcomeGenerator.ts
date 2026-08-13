import type { NonEmptyOutcome, Outcome } from '@/types/bacbopro'

export type { NonEmptyOutcome }

export interface SeededOutcomeOptions {
  seed: number
  count: number
  playerRatio?: number
  tieRatio?: number
  emptyRatio?: number
}

export function createSeededOutcomes(options: SeededOutcomeOptions): Outcome[] {
  const { seed, count, playerRatio = 0.45, tieRatio = 0.08, emptyRatio = 0 } = options
  let state = seed >>> 0
  const next = (): number => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
  const outcomes: Outcome[] = []
  for (let i = 0; i < count; i++) {
    const roll = next()
    if (roll < emptyRatio) {
      outcomes.push('empty')
    } else if (roll < emptyRatio + tieRatio) {
      outcomes.push('tie')
    } else if (roll < emptyRatio + tieRatio + playerRatio) {
      outcomes.push('player')
    } else {
      outcomes.push('banker')
    }
  }
  return outcomes
}

export function chunkRows<T>(items: T[], columns: number): T[][] {
  const rows: T[][] = []
  for (let i = 0; i < items.length; i += columns) {
    rows.push(items.slice(i, i + columns))
  }
  return rows
}

export function chunkColumns<T>(items: T[], columns: number): T[][] {
  const base = Math.floor(items.length / columns)
  const extra = items.length % columns
  const result: T[][] = []
  let offset = 0
  for (let c = 0; c < columns; c++) {
    const size = base + (c < extra ? 1 : 0)
    result.push(items.slice(offset, offset + size))
    offset += size
  }
  return result
}
