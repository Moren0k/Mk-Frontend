import { describe, expect, it } from 'vitest'
import {
  HISTORY_ACTIVE_COLUMNS,
  HISTORY_COLUMNS,
  HISTORY_EMPTY_BUFFER_COLUMNS,
  HISTORY_ROWS,
  appendOutcomeToBigRoad,
  appendOutcomeToColumns,
  buildBigRoadGrid,
  buildHistoryGrid,
  buildStableBigRoadColumns,
  buildStableHistoryColumns,
  buildStatsBlock,
  buildStreakColumns,
  buildStreakLengthFlags,
  buildVisibleStreakColumns,
  computeRunInfo,
  computeRunLengths,
  formatUptime,
  historyToOutcomes,
  matchesStreakLengthFilter,
  operationToEntry,
  projectToHistoryGrid,
  renderHistoryColumnsGrid,
  rollingToStatsBlock,
  STREAK_MAX_ROWS,
  strategyToOption,
  summaryToKpiItems,
  winnerToOutcome,
} from '@/mappers/bacboproMapper'
import type { HistoryItem, OperationVm, ReportSummary } from '@/api/types'
import type { NonEmptyOutcome, OperationDisplayState } from '@/types/bacbopro'

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
  it('only considers the last N plays before grouping into streaks', () => {
    const outcomes: Array<'banker' | 'player'> = []
    for (let i = 0; i < 40; i++) outcomes.push(i % 2 === 0 ? 'banker' : 'player')
    const columns = buildVisibleStreakColumns(outcomes, 6, 14)
    expect(columns).toHaveLength(14)
    expect(columns[0]?.outcome).toBe('banker')
  })

  it('groups a long streak within the history window into a single capped column', () => {
    const outcomes: NonEmptyOutcome[] = [
      'player',
      'player',
      ...Array<NonEmptyOutcome>(14).fill('banker'),
    ]
    const columns = buildVisibleStreakColumns(outcomes, 6, 6)
    expect(columns).toHaveLength(1)
    expect(columns[0]).toEqual({ outcome: 'banker', count: 6 })
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

  it('fills play N (1-indexed) at row ((N-1) % rows) + 1, column ceil(N / rows) — down each column, then across', () => {
    const totalPlays = 200
    // Cada "jugada" se etiqueta con su número para poder rastrear su celda exacta.
    const plays = Array.from({ length: totalPlays }, (_, i) => `play-${i + 1}`) as unknown as (
      | 'player'
      | 'banker'
    )[]
    const grid = buildHistoryGrid(plays, 35, 6)

    function cellForPlay(playNumber: number): unknown {
      const zeroIndexed = playNumber - 1
      const column = Math.floor(zeroIndexed / 6)
      const row = zeroIndexed % 6
      return grid[row]?.[column]
    }

    // Jugada 1 -> fila 1, columna 1. Jugada 6 -> fila 6, columna 1.
    expect(cellForPlay(1)).toBe('play-1')
    expect(cellForPlay(6)).toBe('play-6')
    // Jugada 7 -> vuelve a fila 1, pero en la columna 2.
    expect(cellForPlay(7)).toBe('play-7')
    expect(cellForPlay(12)).toBe('play-12')
    // Jugada 198 completa la columna 33 (198 = 33 columnas x 6 filas).
    expect(cellForPlay(198)).toBe('play-198')
    // Las jugadas 199 y 200 sobrantes caen al inicio de la columna 34.
    expect(cellForPlay(199)).toBe('play-199')
    expect(cellForPlay(200)).toBe('play-200')
    // El resto de la columna 34 y toda la columna 35 quedan vacías (buffer).
    expect(grid[2]?.[33]).toBe('empty')
    expect(grid[0]?.[34]).toBe('empty')
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
    }
    const items = summaryToKpiItems(summary, summary.uptimeMs)
    expect(items).toEqual([
      { label: 'GANADAS', value: '8', tone: 'green' },
      { label: 'ALERTAS', value: '10', tone: 'yellow' },
      { label: 'PERDIDAS', value: '2', tone: 'red' },
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
    expect(HISTORY_COLUMNS).toBe(26)
    expect(HISTORY_ROWS).toBe(6)
  })

  it('always leaves the same 4 trailing columns as an empty buffer', () => {
    expect(HISTORY_EMPTY_BUFFER_COLUMNS).toBe(4)
    expect(HISTORY_ACTIVE_COLUMNS).toBe(HISTORY_COLUMNS - HISTORY_EMPTY_BUFFER_COLUMNS)
    expect(HISTORY_ACTIVE_COLUMNS).toBe(22)
  })
})

describe('appendOutcomeToColumns', () => {
  it('fills the trailing column top to bottom before opening a new one', () => {
    let columns: NonEmptyOutcome[][] = []
    columns = appendOutcomeToColumns(columns, 'player', 6, 32)
    columns = appendOutcomeToColumns(columns, 'banker', 6, 32)
    expect(columns).toEqual([['player', 'banker']])

    columns = appendOutcomeToColumns(columns, 'player', 6, 32)
    columns = appendOutcomeToColumns(columns, 'player', 6, 32)
    columns = appendOutcomeToColumns(columns, 'tie', 6, 32)
    columns = appendOutcomeToColumns(columns, 'tie', 6, 32)
    expect(columns).toEqual([['player', 'banker', 'player', 'player', 'tie', 'tie']])

    // La séptima jugada ya no cabe en la primera columna (llena en 6): abre una nueva.
    columns = appendOutcomeToColumns(columns, 'banker', 6, 32)
    expect(columns).toEqual([
      ['player', 'banker', 'player', 'player', 'tie', 'tie'],
      ['banker'],
    ])
  })

  it('does not touch already-closed columns when the active one keeps growing', () => {
    let columns: NonEmptyOutcome[][] = [['player', 'banker', 'player', 'tie', 'tie', 'banker']]
    const closedColumn = columns[0]
    columns = appendOutcomeToColumns(columns, 'player', 6, 32)
    columns = appendOutcomeToColumns(columns, 'banker', 6, 32)
    // La columna ya cerrada sigue siendo la misma referencia de contenido: nunca se recalcula.
    expect(columns[0]).toEqual(closedColumn)
    expect(columns[1]).toEqual(['player', 'banker'])
  })

  it('drops only the oldest column once maxColumns is exceeded, keeping the rest untouched', () => {
    let columns: NonEmptyOutcome[][] = []
    // 3 columnas cerradas (18 jugadas) con un tope de 3 columnas.
    for (let i = 0; i < 18; i++) {
      columns = appendOutcomeToColumns(columns, i % 2 === 0 ? 'player' : 'banker', 6, 3)
    }
    expect(columns).toHaveLength(3)
    const beforeNewColumn = columns

    // La jugada 19 abre una 4ta columna: debe correr el tablero y descartar solo la más vieja.
    columns = appendOutcomeToColumns(columns, 'tie', 6, 3)
    expect(columns).toHaveLength(3)
    expect(columns[0]).toEqual(beforeNewColumn[1])
    expect(columns[1]).toEqual(beforeNewColumn[2])
    expect(columns[2]).toEqual(['tie'])
  })
})

describe('buildStableHistoryColumns + renderHistoryColumnsGrid', () => {
  it('with 200 plays at 6 rows, keeps exactly HISTORY_ACTIVE_COLUMNS columns and leaves 4 always empty', () => {
    const outcomes: NonEmptyOutcome[] = Array.from({ length: 200 }, (_, i) =>
      i % 2 === 0 ? 'player' : 'banker',
    )
    const columns = buildStableHistoryColumns(outcomes, HISTORY_ROWS, HISTORY_ACTIVE_COLUMNS)
    // 200 jugadas / 6 filas = 33.33 columnas necesarias, pero el tope (22) descarta las más viejas.
    expect(columns).toHaveLength(HISTORY_ACTIVE_COLUMNS)

    const grid = renderHistoryColumnsGrid(columns, HISTORY_ROWS, HISTORY_COLUMNS)
    expect(grid).toHaveLength(HISTORY_ROWS)
    for (const row of grid) expect(row).toHaveLength(HISTORY_COLUMNS)

    // Las últimas 4 columnas (22, 23, 24, 25 en índice 0) siempre quedan vacías.
    for (let row = 0; row < HISTORY_ROWS; row++) {
      for (let column = HISTORY_ACTIVE_COLUMNS; column < HISTORY_COLUMNS; column++) {
        expect(grid[row]?.[column]).toBe('empty')
      }
    }
  })

  it('only redraws the active (last) column as new plays stream in — closed columns stay stable', () => {
    const initial: NonEmptyOutcome[] = Array.from(
      { length: HISTORY_ACTIVE_COLUMNS * HISTORY_ROWS },
      (_, i) => (i % 3 === 0 ? 'tie' : i % 2 === 0 ? 'player' : 'banker'),
    )
    let columns = buildStableHistoryColumns(initial, HISTORY_ROWS, HISTORY_ACTIVE_COLUMNS)
    // Exactamente 22*6=132 jugadas: el tablero está "lleno" justo en el límite de columnas activas.
    expect(columns).toHaveLength(HISTORY_ACTIVE_COLUMNS)
    const snapshotBeforeNewPlay = columns.map((column) => [...column])

    // Llega una jugada nueva: abre una columna 23ª, que de inmediato se descarta por el tope,
    // así que el tablero "corre" un lugar y solo cambia cuál columna quedó fuera.
    columns = appendOutcomeToColumns(columns, 'player', HISTORY_ROWS, HISTORY_ACTIVE_COLUMNS)
    expect(columns).toHaveLength(HISTORY_ACTIVE_COLUMNS)
    // Las demás columnas no cambiaron de contenido, solo se recorrieron una posición.
    for (let i = 0; i < HISTORY_ACTIVE_COLUMNS - 1; i++) {
      expect(columns[i]).toEqual(snapshotBeforeNewPlay[i + 1])
    }
    expect(columns[HISTORY_ACTIVE_COLUMNS - 1]).toEqual(['player'])
  })
})

describe('computeRunLengths', () => {
  it('assigns the total run length to every position within that run', () => {
    const outcomes: NonEmptyOutcome[] = ['banker', 'banker', 'banker', 'player', 'player', 'tie']
    expect(computeRunLengths(outcomes)).toEqual([3, 3, 3, 2, 2, 1])
  })

  it('a tie always cuts the run, even between equal neighbors', () => {
    const outcomes: NonEmptyOutcome[] = ['banker', 'banker', 'tie', 'banker', 'banker']
    expect(computeRunLengths(outcomes)).toEqual([2, 2, 1, 2, 2])
  })

  it('returns an empty array for empty input', () => {
    expect(computeRunLengths([])).toEqual([])
  })
})

describe('computeRunInfo', () => {
  it('offset always counts from the real start of the run, never restarting mid-run', () => {
    // 7 bankers seguidos: una sola racha de longitud 7, offsets 0..6 — NUNCA
    // se trata como "dos rachas de 3" ni se reinicia a la mitad.
    const outcomes: NonEmptyOutcome[] = Array<NonEmptyOutcome>(7).fill('banker')
    const infos = computeRunInfo(outcomes)
    expect(infos.map((info) => info.length)).toEqual(Array(7).fill(7))
    expect(infos.map((info) => info.offset)).toEqual([0, 1, 2, 3, 4, 5, 6])
  })
})

describe('matchesStreakLengthFilter', () => {
  it('3/4/5 match the first N cells of ANY run reaching at least that length (even if it keeps going)', () => {
    // Una racha de longitud 7: el filtro "3" debe marcar solo sus 3 primeras
    // fichas (offsets 0,1,2), no las 3 siguientes como si fuera otra racha.
    expect(matchesStreakLengthFilter({ length: 7, offset: 0 }, 3)).toBe(true)
    expect(matchesStreakLengthFilter({ length: 7, offset: 2 }, 3)).toBe(true)
    expect(matchesStreakLengthFilter({ length: 7, offset: 3 }, 3)).toBe(false)

    expect(matchesStreakLengthFilter({ length: 7, offset: 3 }, 4)).toBe(true)
    expect(matchesStreakLengthFilter({ length: 7, offset: 4 }, 4)).toBe(false)

    expect(matchesStreakLengthFilter({ length: 7, offset: 4 }, 5)).toBe(true)
    expect(matchesStreakLengthFilter({ length: 7, offset: 5 }, 5)).toBe(false)
  })

  it('3/4/5 never match a run shorter than the filter, even at offset 0', () => {
    expect(matchesStreakLengthFilter({ length: 2, offset: 0 }, 3)).toBe(false)
    expect(matchesStreakLengthFilter({ length: 3, offset: 0 }, 4)).toBe(false)
  })

  it('"L" matches every cell of a run of 6 or more, from start to end', () => {
    expect(matchesStreakLengthFilter({ length: 7, offset: 0 }, 'L')).toBe(true)
    expect(matchesStreakLengthFilter({ length: 7, offset: 6 }, 'L')).toBe(true)
    expect(matchesStreakLengthFilter({ length: 5, offset: 0 }, 'L')).toBe(false)
  })
})

describe('buildStreakLengthFlags', () => {
  it('a run of exactly 3 is fully flagged by the "3" filter', () => {
    const outcomes: NonEmptyOutcome[] = [
      'banker',
      'banker',
      'banker',
      'player',
      'tie',
      'tie',
      'tie',
      'player',
      'player',
      'player',
    ]
    const flags = buildStreakLengthFlags(outcomes, 3)
    expect(flags).toEqual([true, true, true, false, false, false, false, true, true, true])
  })

  it('a run LONGER than the filter is only flagged on its first N cells (B-B-B-B-B-B-B example)', () => {
    const outcomes: NonEmptyOutcome[] = Array<NonEmptyOutcome>(7).fill('banker')
    expect(buildStreakLengthFlags(outcomes, 3)).toEqual([
      true,
      true,
      true,
      false,
      false,
      false,
      false,
    ])
    expect(buildStreakLengthFlags(outcomes, 4)).toEqual([
      true,
      true,
      true,
      true,
      false,
      false,
      false,
    ])
    expect(buildStreakLengthFlags(outcomes, 5)).toEqual([
      true,
      true,
      true,
      true,
      true,
      false,
      false,
    ])
  })

  it('a run shorter than the filter is never flagged', () => {
    const outcomes: NonEmptyOutcome[] = ['banker', 'banker']
    expect(buildStreakLengthFlags(outcomes, 3)).toEqual([false, false])
  })

  it('never flags a tie run, even when its length matches the filter', () => {
    const outcomes: NonEmptyOutcome[] = ['tie', 'tie', 'tie']
    expect(buildStreakLengthFlags(outcomes, 3)).toEqual([false, false, false])
  })

  it('"L" flags every cell of a dragon-tail run of 6 or more', () => {
    const outcomes: NonEmptyOutcome[] = Array<NonEmptyOutcome>(7).fill('banker')
    expect(buildStreakLengthFlags(outcomes, 'L')).toEqual(Array(7).fill(true))
  })
})

describe('projectToHistoryGrid', () => {
  it('mirrors buildStableHistoryColumns + renderHistoryColumnsGrid cell for cell', () => {
    const outcomes: NonEmptyOutcome[] = Array.from({ length: 200 }, (_, i) =>
      i % 2 === 0 ? 'player' : 'banker',
    )
    const columns = buildStableHistoryColumns(outcomes, HISTORY_ROWS, HISTORY_ACTIVE_COLUMNS)
    const grid = renderHistoryColumnsGrid(columns, HISTORY_ROWS, HISTORY_COLUMNS)

    const labels = outcomes.map((_, i) => `play-${i}`)
    const projected = projectToHistoryGrid(outcomes, labels, null)

    for (let row = 0; row < HISTORY_ROWS; row++) {
      for (let column = 0; column < HISTORY_COLUMNS; column++) {
        if (grid[row]?.[column] === 'empty') {
          expect(projected[row]?.[column]).toBeNull()
        } else {
          expect(projected[row]?.[column]).not.toBeNull()
        }
      }
    }
  })

  it('fills the empty buffer columns with the given empty value', () => {
    const outcomes: NonEmptyOutcome[] = ['player', 'banker']
    const projected = projectToHistoryGrid(outcomes, [true, true], false)
    expect(projected[0]?.[0]).toBe(true)
    expect(projected[1]?.[0]).toBe(true)
    expect(projected[0]?.[1]).toBe(false)
  })

  it('regression: must be fed the flattened real window, not a fixed-size tail, or cells drift out of phase', () => {
    // El store real nunca reinicia su fold incremental (`historyColumns`
    // crece jugada a jugada desde que abrió la conexión), mientras que "los
    // últimos 200" (`historyOutcomes`) sí se recortan a un tamaño FIJO en
    // cada jugada nueva. Con 220 jugadas vistas en total, 220 % 6 = 4, pero
    // 200 % 6 = 2: reconstruir el chunking desde cero sobre una ventana fija
    // de 200 arranca en una fase distinta a la del fold real, y las celdas
    // quedan desalineadas — la regresión reportada ("rachas incoherentes",
    // el punto no encontraba las jugadas nuevas).
    const totalPlays = 220
    const outcomes: NonEmptyOutcome[] = Array.from({ length: totalPlays }, (_, i) =>
      i % 2 === 0 ? 'player' : 'banker',
    )
    const roundIds = outcomes.map((_, i) => `round-${i}`)

    let historyColumns: NonEmptyOutcome[][] = []
    for (const outcome of outcomes) {
      historyColumns = appendOutcomeToColumns(
        historyColumns,
        outcome,
        HISTORY_ROWS,
        HISTORY_ACTIVE_COLUMNS,
      )
    }

    // Fuente correcta: aplanar la ventana real ya construida incrementalmente.
    const visibleOutcomes = historyColumns.flat()
    const visibleRoundIds = roundIds.slice(-visibleOutcomes.length)
    const correctGrid = projectToHistoryGrid(visibleOutcomes, visibleRoundIds, null)

    // Fuente incorrecta (el bug real): reconstruir el chunking desde cero
    // sobre una ventana de tamaño fijo de 200, en vez de la ventana real.
    const last200Outcomes = outcomes.slice(-200)
    const last200RoundIds = roundIds.slice(-200)
    const buggyGrid = projectToHistoryGrid(last200Outcomes, last200RoundIds, null)

    expect(correctGrid).not.toEqual(buggyGrid)
    // La jugada round-90 sí es visible en la ventana real (22 columnas x 6
    // filas = hasta 132 jugadas, así que entran desde round-90 en adelante),
    // pero la reconstrucción con ventana fija de 200 la deja fuera por el
    // desfase de fase, aunque en teoría "debería" seguir siendo reciente.
    expect(correctGrid.flat()).toContain('round-90')
    expect(buggyGrid.flat()).not.toContain('round-90')
    // La jugada más reciente sí aparece en ambos casos (el borde derecho no
    // se ve afectado por el desfase), pero eso no basta para notar el bug.
    expect(correctGrid.flat()).toContain('round-219')
    expect(buggyGrid.flat()).toContain('round-219')
  })
})

describe('buildBigRoadGrid', () => {
  it('a streak within maxRows goes straight down a single column', () => {
    const grid = buildBigRoadGrid(['banker', 'banker', 'banker'], 6)
    // grid[row][column]
    expect(grid[0]?.[0]).toBe('banker')
    expect(grid[1]?.[0]).toBe('banker')
    expect(grid[2]?.[0]).toBe('banker')
    expect(grid[3]?.[0]).toBe('empty')
  })

  it('a different outcome opens a new column from the top', () => {
    const grid = buildBigRoadGrid(['banker', 'banker', 'player'], 6)
    expect(grid[0]?.[0]).toBe('banker')
    expect(grid[1]?.[0]).toBe('banker')
    expect(grid[0]?.[1]).toBe('player')
    expect(grid[1]?.[1]).toBe('empty')
  })

  it('a streak longer than maxRows forms a dragon tail ("L") along the bottom row', () => {
    // 8 bankers seguidos con maxRows=6: la columna 0 se llena (filas 0-5),
    // y las 2 jugadas extra forman la cola de dragón en la fila 5 (la de
    // abajo), avanzando una columna a la derecha por cada una.
    const outcomes = Array<'banker'>(8).fill('banker')
    const grid = buildBigRoadGrid(outcomes, 6)

    for (let row = 0; row < 6; row++) {
      expect(grid[row]?.[0]).toBe('banker')
    }
    // Columna 1: solo la fila de abajo (5) tiene dato, el resto queda vacío ("L").
    expect(grid[5]?.[1]).toBe('banker')
    for (let row = 0; row < 5; row++) {
      expect(grid[row]?.[1]).toBe('empty')
    }
    // Columna 2: la novena jugada seguiría en la misma fila (5), una columna más a la derecha.
    expect(grid[5]?.[2]).toBe('banker')
    for (let row = 0; row < 5; row++) {
      expect(grid[row]?.[2]).toBe('empty')
    }
  })

  it('after a dragon tail, a different outcome starts a brand new column from the top', () => {
    const outcomes: Array<'banker' | 'player'> = [
      ...Array<'banker'>(7).fill('banker'), // llena columna 0 + 1 celda de cola en columna 1
      'player',
    ]
    const grid = buildBigRoadGrid(outcomes, 6)
    // La cola de dragón dejó la última banker en (fila 5, columna 1).
    expect(grid[5]?.[1]).toBe('banker')
    // El player nuevo abre la columna 2, arriba del todo (fila 0), no continúa la cola.
    expect(grid[0]?.[2]).toBe('player')
  })
})

describe('appendOutcomeToBigRoad / buildStableBigRoadColumns', () => {
  it('matches buildBigRoadGrid for the same sequence when there is no column cap', () => {
    const outcomes: Array<'banker' | 'player'> = [
      ...Array<'banker'>(8).fill('banker'),
      'player',
      'player',
    ]
    const grid = buildBigRoadGrid(outcomes, STREAK_MAX_ROWS)
    const cursor = buildStableBigRoadColumns(outcomes, STREAK_MAX_ROWS, 1000)

    for (let row = 0; row < STREAK_MAX_ROWS; row++) {
      for (let column = 0; column < cursor.columns.length; column++) {
        expect(cursor.columns[column]?.[row]).toBe(grid[row]?.[column] ?? 'empty')
      }
    }
  })

  it('never touches an already-closed column while the active one keeps growing', () => {
    let cursor = buildStableBigRoadColumns(['banker', 'banker', 'banker'], STREAK_MAX_ROWS, 100)
    // La racha de banker se corta con un player: columna 0 queda cerrada.
    cursor = appendOutcomeToBigRoad(cursor, 'player', STREAK_MAX_ROWS, 100)
    const closedColumn = cursor.columns[0]

    cursor = appendOutcomeToBigRoad(cursor, 'player', STREAK_MAX_ROWS, 100)
    cursor = appendOutcomeToBigRoad(cursor, 'tie', STREAK_MAX_ROWS, 100)

    expect(cursor.columns[0]).toEqual(closedColumn)
  })

  it('drops only the oldest column once maxColumns is exceeded', () => {
    // 3 columnas cerradas (banker, player, banker) con un tope de 3 columnas.
    let cursor = buildStableBigRoadColumns(['banker', 'player', 'banker'], STREAK_MAX_ROWS, 3)
    expect(cursor.columns).toHaveLength(3)
    const beforeNewColumn = cursor.columns

    // Un resultado distinto (player) abre una 4ª columna: se descarta solo la más vieja.
    cursor = appendOutcomeToBigRoad(cursor, 'player', STREAK_MAX_ROWS, 3)
    expect(cursor.columns).toHaveLength(3)
    expect(cursor.columns[0]).toEqual(beforeNewColumn[1])
    expect(cursor.columns[1]).toEqual(beforeNewColumn[2])
    expect(cursor.columns[2]?.[0]).toBe('player')
  })

  it('keeps forming the dragon tail correctly even after older columns were dropped', () => {
    let cursor = buildStableBigRoadColumns(['player', 'player', 'tie'], STREAK_MAX_ROWS, 2)
    // Con tope de 2 columnas, la primera (player x2) se descartó al abrir la de "tie".
    expect(cursor.columns).toHaveLength(2)

    // Una racha larga de banker que supera maxRows debe seguir formando la "L".
    for (let i = 0; i < 7; i++) {
      cursor = appendOutcomeToBigRoad(cursor, 'banker', STREAK_MAX_ROWS, 2)
    }
    expect(cursor.columns).toHaveLength(2)
    const [first, second] = cursor.columns
    expect(first?.every((cell) => cell === 'banker')).toBe(true)
    expect(second?.[STREAK_MAX_ROWS - 1]).toBe('banker')
    for (let row = 0; row < STREAK_MAX_ROWS - 1; row++) {
      expect(second?.[row]).toBe('empty')
    }
  })
})
