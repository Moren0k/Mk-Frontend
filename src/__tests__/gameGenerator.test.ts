import { describe, it, expect } from 'vitest'
import { generateGames, generateSingleGame } from '@/mocks/gameGenerator'
import type { Outcome } from '@/types/baccarat'

const VALID_OUTCOMES: Outcome[] = ['PLAYER', 'BANKER', 'TIE']

describe('gameGenerator', () => {
  describe('generateGames', () => {
    it('generates exactly 200 games', () => {
      const games = generateGames(200, 42)
      expect(games).toHaveLength(200)
    })

    it('generates games with valid IDs', () => {
      const games = generateGames(200, 42)
      const ids = new Set(games.map((g) => g.id))
      expect(ids.size).toBe(200)
    })

    it('generates only valid outcomes', () => {
      const games = generateGames(200, 42)
      for (const game of games) {
        expect(VALID_OUTCOMES).toContain(game.outcome)
      }
    })

    it('is deterministic with the same seed', () => {
      const a = generateGames(200, 42)
      const b = generateGames(200, 42)
      expect(a).toEqual(b)
    })

    it('produces different results with different seeds', () => {
      const a = generateGames(200, 42)
      const b = generateGames(200, 99)
      expect(a).not.toEqual(b)
    })

    it('has reasonable outcome distribution', () => {
      const games = generateGames(200, 42)
      const counts = { PLAYER: 0, BANKER: 0, TIE: 0 }
      for (const game of games) {
        counts[game.outcome]++
      }
      expect(counts.BANKER).toBeGreaterThan(60)
      expect(counts.PLAYER).toBeGreaterThan(60)
      expect(counts.TIE).toBeGreaterThan(5)
    })

    it('generates 0 games correctly', () => {
      const games = generateGames(0, 42)
      expect(games).toHaveLength(0)
    })

    it('generates round numbers in chronological order', () => {
      const games = generateGames(200, 42)
      for (let i = 1; i < games.length; i++) {
        expect(games[i]!.roundNumber).toBeGreaterThan(games[i - 1]!.roundNumber)
      }
    })

    it('generates valid scores', () => {
      const games = generateGames(200, 42)
      for (const game of games) {
        expect(game.playerScore).toBeGreaterThanOrEqual(0)
        expect(game.playerScore).toBeLessThanOrEqual(9)
        expect(game.bankerScore).toBeGreaterThanOrEqual(0)
        expect(game.bankerScore).toBeLessThanOrEqual(9)
      }
    })
  })

  describe('generateSingleGame', () => {
    it('generates a valid game with round number', () => {
      const game = generateSingleGame(200)
      expect(game.roundNumber).toBe(201)
      expect(VALID_OUTCOMES).toContain(game.outcome)
      expect(game.id).toBeTruthy()
    })
  })
})
