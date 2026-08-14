import { describe, expect, it } from 'vitest'
import {
  HISTORY_COLUMNS,
  HISTORY_ROWS,
  buildHistoryGrid,
  buildStatsBlock,
  buildStreakColumns,
  buildVisibleStreakColumns,
  formatUptime,
  historyToOutcomes,
  operationToEntry,
  rollingToStatsBlock,
  strategyToOption,
  summaryToKpiItems,
  winnerToOutcome,
} from '@/mappers/bacboproMapper'
import type { HistoryItem, OperationVm, ReportSummary } from '@/api/types'
import type { OperationDisplayState } from '@/types/bacbopro'

function historyItem(winner: HistoryItem['winner'], round = 1): HistoryItem {
  return {
    roundId: `019fef13-0000-0000-0000-${String(round).padStart(12, '0')}`,
    winner,
    score: 9,
    playedAt: '2026-08-11T04:28:11.765Z',
  }
}

function operation(overrides: Partial<OperationVm> = {}): OperationVm {
  return {
    operationId: 'op-1',
    strategyId: 'streak-4',
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

describe('winnerToOutcome', () => {
  it('maps PLAYER, BANKER and TIE', () => {
    expect(winnerToOutcome('PLAYER')).toBe('player')
    expect(winnerToOutcome('BANKER')).toBe('banker')
    expect(winnerToOutcome('TIE')).toBe('tie')
  })
})

describe('historyToOutcomes', () => {
  it('converts history items preserving order', () => {
    const history = [historyItem('BANKER'), historyItem('TIE', 2), historyItem('PLAYER', 3)]
    expect(historyToOutcomes(history)).toEqual(['banker', 'tie', 'player'])
  })
})

describe('buildStreakColumns', () => {
  it('keeps equal outcomes in the same column and splits on change', () => {
    const columns = buildStreakColumns(
      ['banker', 'banker', 'player', 'player', 'tie'],
      6,
    )
    expect(columns).toEqual([
      { outcome: 'banker', count: 2 },
      { outcome: 'player', count: 2 },
      { outcome: 'tie', count: 1 },
    ])
  })

  it('wraps to a new column when max rows are reached', () => {
    const columns = buildStreakColumns(Array(7).fill('banker'), 6)
    expect(columns).toHaveLength(2)
    expect(columns[0]?.count).toBe(6)
    expect(columns[1]?.count).toBe(1)
  })

  it('returns an empty array for empty input', () => {
    expect(buildStreakColumns([], 6)).toEqual([])
  })
})

describe('buildVisibleStreakColumns', () => {
  it('caps the visible columns to the last N', () => {
    const outcomes: Array<'banker' | 'player'> = []
    for (let i = 0; i < 40; i++) outcomes.push(i % 2 === 0 ? 'banker' : 'player')
    const columns = buildVisibleStreakColumns(outcomes, 6, 14)
    expect(columns).toHaveLength(14)
    expect(columns[0]?.outcome).toBe('banker')
  })
})

describe('buildHistoryGrid', () => {
  it('fills a columns x rows grid from the tail', () => {
    const outcomes: Array<'player' | 'banker'> = Array(160).fill('player')
    outcomes[159] = 'banker'
    const grid = buildHistoryGrid(outcomes, 16, 10)
    expect(grid).toHaveLength(10)
    for (const row of grid) expect(row).toHaveLength(16)
    expect(grid[9]?.[15]).toBe('banker')
  })

  it('pads missing cells with empty', () => {
    const grid = buildHistoryGrid(['player', 'banker'], 16, 10)
    expect(grid[0]?.[0]).toBe('player')
    expect(grid[1]?.[0]).toBe('banker')
    expect(grid[0]?.[1]).toBe('empty')
  })
})

describe('buildStatsBlock', () => {
  it('computes integer percentages summing to 100', () => {
    const block = buildStatsBlock(['player', 'player', 'player', 'banker'], 'VENTANA')
    const percentages = Object.fromEntries(
      block.segments.map((segment) => [segment.label, segment.percentage]),
    )
    expect(percentages.PLAYER).toBe(75)
    expect(percentages.BANKER).toBe(25)
    expect(percentages.TIE).toBe(0)
    const total = block.segments.reduce((sum, segment) => sum + segment.percentage, 0)
    expect(total).toBe(100)
  })

  it('returns empty segments for empty input', () => {
    const block = buildStatsBlock([], 'VENTANA')
    expect(block.title).toBe('VENTANA')
    expect(block.segments).toEqual([])
  })
})

describe('rollingToStatsBlock', () => {
  it('maps the documented stats.rolling payload', () => {
    const block = rollingToStatsBlock(
      { window: 200, playerPct: 46, bankerPct: 43, tiePct: 11 },
      'ÚLTIMAS 200',
    )
    expect(block.title).toBe('ÚLTIMAS 200')
    expect(block.segments).toEqual([
      { label: 'PLAYER', outcome: 'player', percentage: 46 },
      { label: 'TIE', outcome: 'tie', percentage: 11 },
      { label: 'BANKER', outcome: 'banker', percentage: 43 },
    ])
  })
})

describe('summaryToKpiItems', () => {
  it('projects won, alertsSent, lost and uptime from the oficial channel', () => {
    const summary: ReportSummary = {
      uptimeMs: 7385000,
      oficial: { won: 8, lost: 2, alertsSent: 10 },
      pruebas: { won: 5, lost: 3, alertsSent: 8 },
    }
    const items = summaryToKpiItems(summary)
    expect(items).toEqual([
      { label: 'WINS', value: '8', tone: 'green' },
      { label: 'ALERTAS ENVIADAS', value: '10', tone: 'yellow' },
      { label: 'LOST', value: '2', tone: 'red' },
      { label: 'TIEMPO', value: '02:03:05', tone: 'mono' },
    ])
  })
})

describe('formatUptime', () => {
  it('formats milliseconds as HH:MM:SS', () => {
    expect(formatUptime(0)).toBe('00:00:00')
    expect(formatUptime(59000)).toBe('00:00:59')
    expect(formatUptime(7385000)).toBe('02:03:05')
    expect(formatUptime(3661000)).toBe('01:01:01')
  })
})

describe('operationToEntry', () => {
  it('maps the OperationVm fields to display fields', () => {
    const entry = operationToEntry(operation(), 2)
    expect(entry).toEqual({
      alertLabel: 'NUEVA ENTRADA',
      strategyId: 'streak-4',
      pattern: 'Racha de 4 resultados consecutivos de BANKER.',
      entryAfterSide: 'banker',
      betOnSide: 'player',
      maxMartingales: 2,
      state: 'OPEN',
    })
  })

  it('maps TIE sides without inventing a side', () => {
    const entry = operationToEntry(
      operation({ streakWinner: 'TIE', recommendedWinner: 'BANKER' }),
      2,
    )
    expect(entry.entryAfterSide).toBe('tie')
    expect(entry.betOnSide).toBe('banker')
  })

  it('caps the displayed max martingales at 2', () => {
    expect(operationToEntry(operation(), 3).maxMartingales).toBe(2)
    expect(operationToEntry(operation(), 99).maxMartingales).toBe(2)
    expect(operationToEntry(operation(), -1).maxMartingales).toBe(0)
  })

  it.each([
    ['OPEN', 'NUEVA ENTRADA'],
    ['MG1', 'MARTINGALA 1'],
    ['MG2', 'MARTINGALA 2'],
    ['WON', 'OPERACIÓN GANADA'],
    ['LOST', 'OPERACIÓN PERDIDA'],
    ['CANCELLED', 'OPERACIÓN CANCELADA'],
  ] as Array<[OperationDisplayState, string]>)('labels the %s state', (state, label) => {
    expect(operationToEntry(operation({ currentState: state }), 2).alertLabel).toBe(label)
  })
})

describe('strategyToOption', () => {
  it('uses the documented id as the option id and label', () => {
    expect(
      strategyToOption({
        id: 'streak-4',
        name: 'Streak4Strategy',
        description: 'Recomienda el ganador opuesto tras 4 resultados consecutivos iguales.',
      }),
    ).toEqual({ id: 'streak-4', label: 'streak-4' })
  })
})

describe('grid constants', () => {
  it('keeps the documented board dimensions', () => {
    expect(HISTORY_COLUMNS).toBe(16)
    expect(HISTORY_ROWS).toBe(10)
  })
})
