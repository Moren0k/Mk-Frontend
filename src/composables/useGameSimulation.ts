import { ref, onUnmounted, readonly } from 'vue'
import { generateSingleGame } from '@/mocks/gameGenerator'
import type { GameResult } from '@/types/baccarat'

export function useGameSimulation(
  onNewGame: (game: GameResult) => void,
  getLastRound: () => number,
) {
  const isRunning = ref(false)
  const speed = ref(3500)
  let timerId: ReturnType<typeof setInterval> | null = null

  function start() {
    if (isRunning.value) return
    isRunning.value = true

    timerId = setInterval(() => {
      const game = generateSingleGame(getLastRound())
      onNewGame(game)
    }, speed.value)
  }

  function stop() {
    isRunning.value = false
    if (timerId !== null) {
      clearInterval(timerId)
      timerId = null
    }
  }

  function setSpeed(ms: number) {
    speed.value = ms
    if (isRunning.value) {
      stop()
      start()
    }
  }

  onUnmounted(() => {
    stop()
  })

  return {
    isRunning: readonly(isRunning),
    speed: readonly(speed),
    start,
    stop,
    setSpeed,
  }
}
