import type {
  DashboardData,
  GameResult,
  StrategyStatus,
  CurrentOperation,
  StreakEntry,
  PercentageStats,
  DailySummary,
} from '@/types/baccarat'

export function calculateStats(games: GameResult[]): PercentageStats {
  if (games.length === 0) {
    return { playerPercentage: 0, tiePercentage: 0, bankerPercentage: 0 }
  }

  const total = games.length
  const counts = { PLAYER: 0, BANKER: 0, TIE: 0 }

  for (const game of games) {
    counts[game.outcome]++
  }

  return {
    playerPercentage: Math.round((counts.PLAYER / total) * 1000) / 10,
    tiePercentage: Math.round((counts.TIE / total) * 1000) / 10,
    bankerPercentage: Math.round((counts.BANKER / total) * 1000) / 10,
  }
}

export function calculateStreaks(games: GameResult[]): StreakEntry[] {
  if (games.length === 0) return []

  const streaks: StreakEntry[] = []
  let currentOutcome = games[0]!.outcome
  let count = 1

  for (let i = 1; i < games.length; i++) {
    if (games[i]!.outcome === currentOutcome) {
      count++
    } else {
      streaks.push({ outcome: currentOutcome, count })
      currentOutcome = games[i]!.outcome
      count = 1
    }
  }

  streaks.push({ outcome: currentOutcome, count })

  return streaks.slice(-20)
}

export function calculateDailySummary(games: GameResult[]): DailySummary {
  const activeMinutes = games.length > 0 ? Math.ceil(games.length / 60) : 0
  const hours = Math.floor(activeMinutes / 60)
  const minutes = activeMinutes % 60

  const wins = games.filter((g) => g.outcome === 'PLAYER' || g.outcome === 'BANKER').length
  const losses = games.filter((g) => g.outcome === 'TIE').length
  const totalOps = wins + losses

  return {
    activeTimeFormatted: `${hours}h ${String(minutes).padStart(2, '0')}m`,
    closedOperations: totalOps,
    wins,
    losses,
    winRatePercentage: totalOps > 0 ? Math.round((wins / totalOps) * 1000) / 10 : 0,
  }
}

export function mapToDashboardData(
  games: GameResult[],
  strategies: StrategyStatus[],
  currentOperation: CurrentOperation,
  isRealTimeConnected: boolean,
): DashboardData {
  const last200 = games.slice(-200)
  const last50 = games.slice(-50)

  return {
    isRealTimeConnected,
    summary: calculateDailySummary(last200),
    strategies,
    lastWinner: games.length > 0 ? games[games.length - 1]! : null,
    currentOperation,
    last200Games: last200,
    streakBoard: calculateStreaks(last200),
    statsLast200: calculateStats(last200),
    statsLast50Sync: calculateStats(last50),
  }
}
