export type Outcome = 'PLAYER' | 'BANKER' | 'TIE'

export type OperationState = 'MG1' | 'MG2' | 'EP' | 'WAITING' | 'WIN' | 'LOSS'

export interface GameResult {
  id: string
  roundNumber: number
  outcome: Outcome
  timestamp: number
  playerScore: number
  bankerScore: number
}

export interface DailySummary {
  activeTimeFormatted: string
  closedOperations: number
  wins: number
  losses: number
  winRatePercentage: number
}

export interface StrategyStatus {
  id: string
  name: string
  isBotActive: boolean
  activeScore: number
  logoUrl?: string
}

export interface CurrentOperation {
  targetOutcome: Outcome
  targetName: string
  triggerAfterOutcome: Outcome
  triggerAfterName: string
  state: OperationState
  progressStep?: number
}

export interface PercentageStats {
  playerPercentage: number
  tiePercentage: number
  bankerPercentage: number
}

export interface StreakEntry {
  outcome: Outcome
  count: number
}

export interface DashboardData {
  isRealTimeConnected: boolean
  summary: DailySummary
  strategies: StrategyStatus[]
  lastWinner: GameResult | null
  currentOperation: CurrentOperation
  last200Games: GameResult[]
  streakBoard: StreakEntry[]
  statsLast200: PercentageStats
  statsLast50Sync: PercentageStats
}
