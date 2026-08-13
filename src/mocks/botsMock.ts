import type { StrategyStatus } from '@/types/baccarat'

export const strategiesMock: StrategyStatus[] = [
  {
    id: 'bot-001',
    name: 'Martingala Clásica',
    isBotActive: true,
    activeScore: 87,
  },
  {
    id: 'bot-002',
    name: 'Fibonacci Pro',
    isBotActive: true,
    activeScore: 64,
  },
  {
    id: 'bot-003',
    name: 'Tendencia Dual',
    isBotActive: false,
    activeScore: 45,
  },
  {
    id: 'bot-004',
    name: 'Racha Dinámica',
    isBotActive: true,
    activeScore: 92,
  },
  {
    id: 'bot-005',
    name: 'Conservador Banker',
    isBotActive: false,
    activeScore: 31,
  },
]
