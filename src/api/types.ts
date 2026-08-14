export interface Envelope<T, TMeta = never> {
  data: T
  meta?: TMeta
  requestId: string
}

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL'
  | 'UNAVAILABLE'
  | 'FORBIDDEN'
  | 'RATE_LIMITED'
  | 'DEPENDENCY_DOWN'

export interface ApiErrorDetails {
  reason: string
}

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode
    message: string
    details?: ApiErrorDetails[]
    requestId: string
    timestamp: string
  }
}

export type Winner = 'PLAYER' | 'BANKER' | 'TIE'

export type ChannelId = 'oficial' | 'pruebas'

export interface HealthDbStatus {
  ok: boolean
  latencyMs?: number
  error?: unknown
}

export interface HealthData {
  ok: boolean
  collectorConnected: boolean
  lastGameReceivedAt: string | null
  gamesInMemory: number
  activeOperations: number
  registeredStrategies: number
  registeredChannels: number
  lastError: { message: string; occurredAt: string } | null
  db: HealthDbStatus
}

export interface StatisticsData {
  totalGames: number
  playerWinRate: number
  bankerWinRate: number
  tieRate: number
  currentStreak: { winner: Winner | null; length: number }
}

export interface HistoryItem {
  roundId: string
  winner: Winner
  score: number
  playedAt: string
}

export interface HistoryMeta {
  limit: number
  count: number
}

export type OperationState = 'OPEN' | 'MG1' | 'MG2' | 'WON' | 'LOST' | 'CANCELLED'

export interface OperationVm {
  operationId: string
  strategyId: string
  recommendedWinner: Winner
  streakWinner: Winner
  currentState: OperationState
  currentMartingale: number
  reason: string
  openedAt: string
  closedAt: string | null
}

export interface ChannelState {
  channel: ChannelId
  strategyId: string | null
  active: boolean
  maxMartingalesOverride: number | null
}

export interface PatchChannelBody {
  strategyId?: string
  active?: boolean
  maxMartingales?: number
}

export interface ChannelReportSummary {
  won: number
  lost: number
  alertsSent: number
}

export interface ReportSummary {
  uptimeMs: number
  oficial: ChannelReportSummary
  pruebas: ChannelReportSummary
}

export type AdminReportChannel = ChannelId | 'todos'

export interface AdminReportResult {
  channel: AdminReportChannel
  dispatchedAt: string
  metrics: {
    oficial: SummaryReportResult
    pruebas: SummaryReportResult
  }
}

export interface SummaryReportResult {
  [key: string]: unknown
}

export interface StrategyCatalogItem {
  id: string
  name: string
  description: string
}

export interface GameReceivedPayload {
  roundId: string
  winner: Winner
  score: number
  playedAt: string
}

export interface StatsRollingPayload {
  window: 200 | 50
  playerPct: number
  bankerPct: number
  tiePct: number
}

export interface SseEnvelope<T> {
  type: string
  payload: T
  occurredAt: string
}

export type GameReceivedEvent = SseEnvelope<GameReceivedPayload> & { type: 'game.received' }

export type StatsRollingEvent = SseEnvelope<StatsRollingPayload> & { type: 'stats.rolling' }

export type OperationEventType =
  | 'operation.opened'
  | 'operation.mg1'
  | 'operation.mg2'
  | 'operation.tie'
  | 'operation.won'
  | 'operation.lost'
  | 'operation.cancelled'

export type OperationEvent = SseEnvelope<OperationVm> & { type: OperationEventType }

export type SseEvent = GameReceivedEvent | StatsRollingEvent | OperationEvent

export interface SseEventHandlers {
  onGameReceived?: (event: GameReceivedEvent) => void
  onStatsRolling?: (event: StatsRollingEvent) => void
  onOperation?: (event: OperationEvent) => void
  onError?: (error: Error) => void
}
