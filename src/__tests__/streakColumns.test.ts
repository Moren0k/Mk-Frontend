import { describe, expect, it } from 'vitest'
import { buildStreakColumns, historyGrid, mockResults } from '@/mocks/bacbopro/resultsData'
import { STREAK_MAX_ROWS } from '@/mocks/bacbopro/resultsData'
import { statsLast200, statsLast50 } from '@/mocks/bacbopro/historyData'
import type { NonEmptyOutcome } from '@/types/bacbopro'

describe('buildStreakColumns', () => {
  it('keeps equal outcomes in the same column', () => {
    const columns = buildStreakColumns(['banker', 'banker', 'banker'], 6)
    expect(columns).toHaveLength(1)
    expect(columns[0]?.outcome).toBe('banker')
    expect(columns[0]?.count).toBe(3)
  })

  it('starts a new column when the outcome changes', () => {
    const columns = buildStreakColumns(
      ['banker', 'banker', 'player', 'player', 'tie', 'tie', 'banker'],
      6,
    )
    expect(columns.map((column) => column.outcome)).toEqual([
      'banker',
      'player',
      'tie',
      'banker',
    ])
    expect(columns.map((column) => column.count)).toEqual([2, 2, 2, 1])
  })

  it('wraps to a new column when the max rows are reached', () => {
    const columns = buildStreakColumns(Array(7).fill('banker'), 6)
    expect(columns).toHaveLength(2)
    expect(columns[0]?.count).toBe(6)
    expect(columns[1]?.count).toBe(1)
  })

  it('works for red, blue and yellow outcomes', () => {
    const columns = buildStreakColumns(
      ['banker', 'banker', 'player', 'tie', 'tie', 'tie', 'player'],
      6,
    )
    expect(columns.map((column) => column.outcome)).toEqual([
      'banker',
      'player',
      'tie',
      'player',
    ])
  })

  it('conserves the total number of results', () => {
    const columns = buildStreakColumns(mockResults, STREAK_MAX_ROWS)
    const total = columns.reduce((sum, column) => sum + column.count, 0)
    expect(total).toBe(mockResults.length)
  })

  it('never exceeds the max rows in a single column', () => {
    const columns = buildStreakColumns(mockResults, STREAK_MAX_ROWS)
    for (const column of columns) {
      expect(column.count).toBeLessThanOrEqual(STREAK_MAX_ROWS)
    }
  })
})

describe('historyGrid', () => {
  it('is a 16x10 grid', () => {
    expect(historyGrid).toHaveLength(10)
    for (const row of historyGrid) {
      expect(row).toHaveLength(16)
    }
  })

  it('contains only valid cell states', () => {
    const states = ['player', 'banker', 'tie', 'empty']
    for (const cell of historyGrid.flat()) {
      expect(states).toContain(cell)
    }
  })

  it('is built from the same results source as the streak board', () => {
    const lastResult = mockResults[mockResults.length - 1]
    const bottomRight = historyGrid[9]?.[15]
    expect(bottomRight).toBe(lastResult)
  })
})

describe('stats windows', () => {
  function percentagesOf(results: NonEmptyOutcome[]) {
    const total = results.length
    const counts: Record<NonEmptyOutcome, number> = { player: 0, tie: 0, banker: 0 }
    for (const outcome of results) {
      counts[outcome] += 1
    }
    return {
      player: Math.round((counts.player / total) * 100),
      tie: Math.round((counts.tie / total) * 100),
      banker: Math.round((counts.banker / total) * 100),
    }
  }

  function byLabel(block: { segments: { label: string; percentage: number }[] }) {
    return Object.fromEntries(block.segments.map((segment) => [segment.label, segment.percentage]))
  }

  it('statsLast200 is computed from the last 200 results', () => {
    const expected = percentagesOf(mockResults.slice(-200))
    const actual = byLabel(statsLast200)
    expect(actual.PLAYER).toBe(expected.player)
    expect(actual.TIE).toBe(expected.tie)
  })

  it('statsLast50 is computed from exactly the last 50 results', () => {
    const window = mockResults.slice(-50)
    expect(window).toHaveLength(50)
    const expected = percentagesOf(window)
    const actual = byLabel(statsLast50)
    expect(actual.PLAYER).toBe(expected.player)
    expect(actual.TIE).toBe(expected.tie)
  })

  it('each stats block sums to 100 percent', () => {
    for (const block of [statsLast200, statsLast50]) {
      const total = block.segments.reduce((sum, segment) => sum + segment.percentage, 0)
      expect(total).toBe(100)
    }
  })
})
