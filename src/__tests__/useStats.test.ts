import { describe, it, expect } from 'vitest'
import { generateGames } from '@/mocks/gameGenerator'
import { calculateStats, calculateStreaks } from '@/mappers/dashboardMapper'

describe('useStats', () => {
  describe('stats calculation edge cases', () => {
    it('handles empty array', () => {
      const stats = calculateStats([])
      expect(stats.playerPercentage).toBe(0)
      expect(stats.bankerPercentage).toBe(0)
      expect(stats.tiePercentage).toBe(0)
    })

    it('handles exactly 50 games', () => {
      const games = generateGames(50, 42)
      const stats = calculateStats(games)
      const sum = stats.playerPercentage + stats.tiePercentage + stats.bankerPercentage
      expect(sum).toBeGreaterThanOrEqual(99)
      expect(sum).toBeLessThanOrEqual(101)
    })

    it('handles exactly 200 games', () => {
      const games = generateGames(200, 42)
      const stats = calculateStats(games)
      const sum = stats.playerPercentage + stats.tiePercentage + stats.bankerPercentage
      expect(sum).toBeGreaterThanOrEqual(99)
      expect(sum).toBeLessThanOrEqual(101)
    })

    it('handles more than 200 games', () => {
      const games = generateGames(500, 42)
      const stats = calculateStats(games)
      expect(stats.bankerPercentage).toBeGreaterThan(0)
    })

    it('handles single game', () => {
      const games = generateGames(1, 42)
      const stats = calculateStats(games)
      const nonZeroCount = [stats.playerPercentage, stats.tiePercentage, stats.bankerPercentage].filter(
        (v) => v > 0,
      ).length
      expect(nonZeroCount).toBe(1)
    })
  })

  describe('streaks edge cases', () => {
    it('handles empty games', () => {
      const streaks = calculateStreaks([])
      expect(streaks).toEqual([])
    })

    it('handles single game streak', () => {
      const games = generateGames(1, 42)
      const streaks = calculateStreaks(games)
      expect(streaks).toHaveLength(1)
      expect(streaks[0]!.count).toBe(1)
    })

    it('max 20 streaks returned', () => {
      const games = generateGames(500, 42)
      const streaks = calculateStreaks(games)
      expect(streaks.length).toBeLessThanOrEqual(20)
    })
  })
})
