import type { DashboardData, CurrentOperation } from '@/types/baccarat'
import { generateGames } from './gameGenerator'
import { strategiesMock } from './botsMock'
import { mapToDashboardData } from '@/mappers/dashboardMapper'

const currentOperationMock: CurrentOperation = {
  targetOutcome: 'BANKER',
  targetName: 'Banker',
  triggerAfterOutcome: 'PLAYER',
  triggerAfterName: 'Player',
  state: 'WAITING',
  progressStep: 40,
}

export function createDashboardData(): DashboardData {
  const games = generateGames(200, 42)
  return mapToDashboardData(games, strategiesMock, currentOperationMock, true)
}
