import type { GameResult, PercentageStats, StreakEntry } from '@/types/baccarat'
import { calculateStats, calculateStreaks } from '@/mappers/dashboardMapper'

export function useStats(games: () => GameResult[]) {
  function getStats(sampleSize?: number): PercentageStats {
    const all = games()
    const sample = sampleSize ? all.slice(-sampleSize) : all
    return calculateStats(sample)
  }

  function getStreaks(sampleSize?: number): StreakEntry[] {
    const all = games()
    const sample = sampleSize ? all.slice(-sampleSize) : all
    return calculateStreaks(sample)
  }

  function getPlayerPercentage(sampleSize?: number): number {
    return getStats(sampleSize).playerPercentage
  }

  function getBankerPercentage(sampleSize?: number): number {
    return getStats(sampleSize).bankerPercentage
  }

  function getTiePercentage(sampleSize?: number): number {
    return getStats(sampleSize).tiePercentage
  }

  return {
    getStats,
    getStreaks,
    getPlayerPercentage,
    getBankerPercentage,
    getTiePercentage,
  }
}
