import type { StatsBlock } from '@/types/bacbopro'

export const statsLast200: StatsBlock = {
  title: 'ÚLTIMAS 200',
  segments: [
    { label: 'PLAYER', percentage: 45, outcome: 'player' },
    { label: 'TIE', percentage: 9, outcome: 'tie' },
    { label: 'BANKER', percentage: 46, outcome: 'banker' },
  ],
}

export const statsLast100: StatsBlock = {
  title: 'ÚLTIMAS 100',
  segments: [
    { label: 'PLAYER', percentage: 48, outcome: 'player' },
    { label: 'TIE', percentage: 8, outcome: 'tie' },
    { label: 'BANKER', percentage: 44, outcome: 'banker' },
  ],
}
