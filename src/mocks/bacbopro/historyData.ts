import type { StatsBlock } from '@/types/bacbopro'
import { mockResults } from './resultsData'
import { buildStatsBlock } from '@/mappers/bacboproMapper'

export const statsLast200: StatsBlock = buildStatsBlock(mockResults, 'ÚLTIMAS 200')

export const statsLast50: StatsBlock = buildStatsBlock(mockResults.slice(-50), 'ÚLTIMAS 50')
