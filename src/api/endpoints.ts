import type {
  AdminReportChannel,
  AdminReportResult,
  ChannelId,
  ChannelState,
  Envelope,
  HealthData,
  HistoryItem,
  HistoryMeta,
  OperationVm,
  PatchChannelBody,
  ReportSummary,
  StatisticsData,
  StrategyCatalogItem,
  SseEventHandlers,
} from './types'
import { apiRequest } from './client'
import { startEventsStream } from './sse'

export function getHealth(): Promise<Envelope<HealthData>> {
  return apiRequest<HealthData>({ path: '/health', auth: false })
}

export function getStatistics(): Promise<Envelope<StatisticsData>> {
  return apiRequest<StatisticsData>({ path: '/statistics' })
}

export async function getHistory(limit = 50): Promise<Envelope<HistoryItem[], HistoryMeta>> {
  const response = await apiRequest<HistoryItem[]>({ path: '/history', query: { limit } })
  return response as Envelope<HistoryItem[], HistoryMeta>
}

export function getOperations(channel: ChannelId): Promise<Envelope<OperationVm[]>> {
  return apiRequest<OperationVm[]>({ path: '/operations', query: { channel } })
}

export function cancelOperation(id: string): Promise<Envelope<OperationVm>> {
  return apiRequest<OperationVm>({
    path: `/operations/${encodeURIComponent(id)}/cancel`,
    method: 'POST',
  })
}

export function getChannel(channel: ChannelId): Promise<Envelope<ChannelState>> {
  return apiRequest<ChannelState>({ path: `/channels/${channel}` })
}

export function patchChannel(
  channel: ChannelId,
  body: PatchChannelBody,
): Promise<Envelope<ChannelState>> {
  return apiRequest<ChannelState>({ path: `/channels/${channel}`, method: 'PATCH', body })
}

export function getReportsSummary(): Promise<Envelope<ReportSummary>> {
  return apiRequest<ReportSummary>({ path: '/reports/summary' })
}

export function postAdminReports(
  channel: AdminReportChannel = 'todos',
): Promise<Envelope<AdminReportResult>> {
  return apiRequest<AdminReportResult>({ path: '/admin/reports', method: 'POST', query: { channel } })
}

export function getStrategies(): Promise<Envelope<StrategyCatalogItem[]>> {
  return apiRequest<StrategyCatalogItem[]>({ path: '/strategies' })
}

export function openEventsStream(handlers: SseEventHandlers) {
  return startEventsStream(handlers)
}
