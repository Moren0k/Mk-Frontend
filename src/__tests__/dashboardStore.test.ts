import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDashboardStore } from '@/stores/dashboard'
import type { GameResult } from '@/types/baccarat'

describe('dashboardStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with 200 games', () => {
    const store = useDashboardStore()
    expect(store.last200Games).toHaveLength(200)
  })

  it('initializes with 5 strategies', () => {
    const store = useDashboardStore()
    expect(store.strategies).toHaveLength(5)
  })

  it('addGame pushes a new game', () => {
    const store = useDashboardStore()
    const newGame: GameResult = {
      id: 'test-999',
      roundNumber: 999,
      outcome: 'BANKER',
      timestamp: Date.now(),
      playerScore: 5,
      bankerScore: 7,
    }
    store.addGame(newGame)
    expect(store.last200Games).toHaveLength(200)
    expect(store.last200Games[store.last200Games.length - 1]!.id).toBe('test-999')
  })

  it('maintains max 200 games', () => {
    const store = useDashboardStore()
    for (let i = 0; i < 50; i++) {
      store.addGame({
        id: `test-${i}`,
        roundNumber: 1000 + i,
        outcome: 'PLAYER',
        timestamp: Date.now(),
        playerScore: 8,
        bankerScore: 3,
      })
    }
    expect(store.last200Games).toHaveLength(200)
  })

  it('updates lastWinner on addGame', () => {
    const store = useDashboardStore()
    const newGame: GameResult = {
      id: 'winner-test',
      roundNumber: 1234,
      outcome: 'PLAYER',
      timestamp: Date.now(),
      playerScore: 9,
      bankerScore: 0,
    }
    store.addGame(newGame)
    expect(store.lastWinner?.id).toBe('winner-test')
  })

  it('changes operation state', () => {
    const store = useDashboardStore()
    store.setOperationState('WIN')
    expect(store.currentOperation.state).toBe('WIN')

    store.setOperationState('LOSS')
    expect(store.currentOperation.state).toBe('LOSS')

    store.setOperationState('MG1')
    expect(store.currentOperation.state).toBe('MG1')
  })

  it('toggles bot active state', () => {
    const store = useDashboardStore()
    const botId = store.strategies[0]!.id
    const initialState = store.strategies[0]!.isBotActive
    store.toggleBot(botId)
    expect(store.strategies[0]!.isBotActive).toBe(!initialState)
    store.toggleBot(botId)
    expect(store.strategies[0]!.isBotActive).toBe(initialState)
  })

  it('sets real time connection', () => {
    const store = useDashboardStore()
    store.setRealTimeConnected(false)
    expect(store.isRealTimeConnected).toBe(false)
    expect(store.dashboardData.isRealTimeConnected).toBe(false)

    store.setRealTimeConnected(true)
    expect(store.isRealTimeConnected).toBe(true)
  })

  it('updates operation progress', () => {
    const store = useDashboardStore()
    store.updateOperationProgress(75)
    expect(store.currentOperation.progressStep).toBe(75)
  })
})
