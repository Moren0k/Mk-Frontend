import { describe, it, expect } from 'vitest'
import { calculateStats, calculateStreaks, calculateDailySummary, mapToDashboardData } from '@/mappers/dashboardMapper'
import { generateGames } from '@/mocks/gameGenerator'
import { strategiesMock } from '@/mocks/botsMock'
import type { CurrentOperation } from '@/types/baccarat'

const currentOpMock: CurrentOperation = {
  targetOutcome: 'BANKER',
  targetName: 'Banker',
  triggerAfterOutcome: 'PLAYER',
  triggerAfterName: 'Player',
  state: 'WAITING',
}

describe('dashboardMapper', () => {
  describe('calculateStats', () => {
    it('returns zero stats for empty array', () => {
      const stats = calculateStats([])
      expect(stats).toEqual({
        playerPercentage: 0,
        tiePercentage: 0,
        bankerPercentage: 0,
      })
    })

    it('calculates stats for 200 games', () => {
      const games = generateGames(200, 42)
      const stats = calculateStats(games)
      expect(stats.playerPercentage).toBeGreaterThan(0)
      expect(stats.bankerPercentage).toBeGreaterThan(0)
      expect(stats.tiePercentage).toBeGreaterThan(0)
    })

    it('sum of percentages is approximately 100', () => {
      const games = generateGames(200, 42)
      const stats = calculateStats(games)
      const sum = stats.playerPercentage + stats.tiePercentage + stats.bankerPercentage
      expect(sum).toBeGreaterThanOrEqual(99)
      expect(sum).toBeLessThanOrEqual(101)
    })

    it('handles single result', () => {
      const games = generateGames(1, 42)
      const stats = calculateStats(games)
      const sum = stats.playerPercentage + stats.tiePercentage + stats.bankerPercentage
      expect(sum).toBe(100)
    })
  })

  describe('calculateStreaks', () => {
    it('returns empty array for no games', () => {
      const streaks = calculateStreaks([])
      expect(streaks).toEqual([])
    })

    it('returns streaks for games', () => {
      const games = generateGames(200, 42)
      const streaks = calculateStreaks(games)
      expect(streaks.length).toBeGreaterThan(0)
      for (const entry of streaks) {
        expect(entry.count).toBeGreaterThan(0)
        expect(['PLAYER', 'BANKER', 'TIE']).toContain(entry.outcome)
      }
    })
  })

  describe('calculateDailySummary', () => {
    it('returns summary for games', () => {
      const games = generateGames(200, 42)
      const summary = calculateDailySummary(games)
      expect(summary.activeTimeFormatted).toBeTruthy()
      expect(summary.closedOperations).toBeGreaterThan(0)
      expect(summary.wins).toBeGreaterThan(0)
    })
  })

  describe('mapToDashboardData', () => {
    it('creates correct DashboardData structure', () => {
      const games = generateGames(200, 42)
      const data = mapToDashboardData(games, strategiesMock, currentOpMock, true)

      expect(data.isRealTimeConnected).toBe(true)
      expect(data.strategies).toHaveLength(5)
      expect(data.last200Games).toHaveLength(200)
      expect(data.statsLast200.playerPercentage).toBeGreaterThan(0)
      expect(data.statsLast50Sync.playerPercentage).toBeGreaterThan(0)
      expect(data.currentOperation.state).toBe('WAITING')
      expect(data.streakBoard.length).toBeGreaterThan(0)
    })

    it('sets lastWinner correctly', () => {
      const games = generateGames(200, 42)
      const data = mapToDashboardData(games, strategiesMock, currentOpMock, true)
      expect(data.lastWinner).not.toBeNull()
      expect(data.lastWinner!.roundNumber).toBe(games[games.length - 1]!.roundNumber)
    })

    it('handles last50Sync correctly', () => {
      const games = generateGames(200, 42)
      const data = mapToDashboardData(games, strategiesMock, currentOpMock, true)
      const last50 = games.slice(-50)
      const expectedStats = calculateStats(last50)
      expect(data.statsLast50Sync.playerPercentage).toBe(expectedStats.playerPercentage)
    })
  })
})
