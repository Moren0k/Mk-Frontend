import type { GameResult, Outcome } from '@/types/baccarat'

function seededRandom(seed: number): () => number {
  let s = seed | 0
  return () => {
    s = (s * 1664525 + 1013904223) | 0
    return (s >>> 0) / 4294967296
  }
}

function weightedOutcome(rand: number): Outcome {
  if (rand < 0.1) return 'TIE'
  if (rand < 0.55) return 'BANKER'
  return 'PLAYER'
}

function generateId(index: number): string {
  return `game-${String(index).padStart(6, '0')}`
}

export function generateGames(count: number, seed: number = 42): GameResult[] {
  const rand = seededRandom(seed)
  const games: GameResult[] = []
  const now = 1750000000000 + seed * 1000

  for (let i = 0; i < count; i++) {
    const outcome = weightedOutcome(rand())
    const playerScore = Math.floor(rand() * 10)
    let bankerScore: number
    if (outcome === 'PLAYER') {
      bankerScore = Math.max(0, Math.min(playerScore - 1, Math.floor(rand() * playerScore)))
    } else if (outcome === 'BANKER') {
      bankerScore = Math.min(9, Math.max(playerScore + 1, Math.floor(rand() * 10)))
    } else {
      bankerScore = playerScore
    }

    games.push({
      id: generateId(count - i),
      roundNumber: count - i,
      outcome,
      timestamp: now - (count - i) * 60000,
      playerScore,
      bankerScore,
    })
  }

  return games.reverse()
}

export function generateSingleGame(lastRound: number, seed?: number): GameResult {
  const now = Date.now()
  const rand = seed !== undefined ? seededRandom(seed)() : Math.random()
  const outcome = weightedOutcome(rand)
  const playerScore = Math.floor(Math.random() * 10)
  let bankerScore: number

  if (outcome === 'PLAYER') {
    bankerScore = playerScore > 0 ? Math.floor(Math.random() * playerScore) : playerScore
  } else if (outcome === 'BANKER') {
    bankerScore = Math.min(9, playerScore + Math.floor(Math.random() * (9 - playerScore) + 1))
  } else {
    bankerScore = playerScore
  }

  return {
    id: `game-${String(lastRound + 1).padStart(6, '0')}`,
    roundNumber: lastRound + 1,
    outcome,
    timestamp: now,
    playerScore,
    bankerScore,
  }
}
