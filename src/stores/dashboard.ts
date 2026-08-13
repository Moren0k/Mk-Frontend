import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { DashboardData, GameResult, OperationState } from '@/types/baccarat'
import { createDashboardData } from '@/mocks/dashboardMock'
import { mapToDashboardData } from '@/mappers/dashboardMapper'

export const useDashboardStore = defineStore('dashboard', () => {
  const dashboardData = ref<DashboardData>(createDashboardData())
  const isRealTimeConnected = ref(true)
  const simulationRunning = ref(false)
  const simulationSpeed = ref(3500)

  const last200Games = computed(() => dashboardData.value.last200Games)
  const currentOperation = computed(() => dashboardData.value.currentOperation)
  const strategies = computed(() => dashboardData.value.strategies)
  const lastWinner = computed(() => dashboardData.value.lastWinner)
  const summary = computed(() => dashboardData.value.summary)
  const streakBoard = computed(() => dashboardData.value.streakBoard)
  const statsLast200 = computed(() => dashboardData.value.statsLast200)
  const statsLast50Sync = computed(() => dashboardData.value.statsLast50Sync)

  function addGame(game: GameResult) {
    const games = [...dashboardData.value.last200Games, game]
    const trimmed = games.length > 200 ? games.slice(games.length - 200) : games
    const allGames = trimmed

    dashboardData.value = mapToDashboardData(
      allGames,
      dashboardData.value.strategies,
      dashboardData.value.currentOperation,
      dashboardData.value.isRealTimeConnected,
    )
  }

  function setOperationState(state: OperationState) {
    dashboardData.value.currentOperation = {
      ...dashboardData.value.currentOperation,
      state,
    }
  }

  function updateOperationProgress(progressStep: number) {
    dashboardData.value.currentOperation = {
      ...dashboardData.value.currentOperation,
      progressStep,
    }
  }

  function toggleBot(botId: string) {
    const updated = dashboardData.value.strategies.map((s) =>
      s.id === botId ? { ...s, isBotActive: !s.isBotActive } : s,
    )
    dashboardData.value = {
      ...dashboardData.value,
      strategies: updated,
    }
  }

  function setRealTimeConnected(connected: boolean) {
    dashboardData.value = {
      ...dashboardData.value,
      isRealTimeConnected: connected,
    }
    isRealTimeConnected.value = connected
  }

  function setSimulationRunning(running: boolean) {
    simulationRunning.value = running
  }

  function setSimulationSpeed(speed: number) {
    simulationSpeed.value = speed
  }

  function regenerateData() {
    dashboardData.value = createDashboardData()
  }

  return {
    dashboardData,
    isRealTimeConnected,
    simulationRunning,
    simulationSpeed,
    last200Games,
    currentOperation,
    strategies,
    lastWinner,
    summary,
    streakBoard,
    statsLast200,
    statsLast50Sync,
    addGame,
    setOperationState,
    updateOperationProgress,
    toggleBot,
    setRealTimeConnected,
    setSimulationRunning,
    setSimulationSpeed,
    regenerateData,
  }
})
