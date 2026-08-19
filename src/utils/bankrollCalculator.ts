import { roundDownToStep } from './currency'

/**
 * Estrategia 1‑2‑4 (máximo 2 gales): apuesta base (1x), gale 1 (2x), gale 2
 * (4x). Un ciclo perdido completo consume 7 veces la apuesta base
 * (`CYCLE_MULTIPLIER`). Cuántos ciclos perdidos consecutivos debe poder
 * soportar el saldo lo define el perfil de riesgo elegido (ver
 * `stopLossTakeProfit.ts` → `RiskProfileDefinition.cyclesToSurvive`).
 */
export const MIN_BET = 5_000
export const GALE_MULTIPLIERS = { base: 1, gale1: 2, gale2: 4 } as const
export const CYCLE_MULTIPLIER =
  GALE_MULTIPLIERS.base + GALE_MULTIPLIERS.gale1 + GALE_MULTIPLIERS.gale2

export function minBalanceRequiredFor(cyclesToSurvive: number): number {
  return MIN_BET * CYCLE_MULTIPLIER * cyclesToSurvive
}

export interface BankrollSufficientResult {
  sufficient: true
  balance: number
  cyclesToSurvive: number
  baseBet: number
  gale1: number
  gale2: number
  cycleLossCost: number
  totalLossCost: number
  remainingBalance: number
}

export interface BankrollInsufficientResult {
  sufficient: false
  balance: number
  cyclesToSurvive: number
  minBalanceRequired: number
  missingAmount: number
}

export type BankrollResult = BankrollSufficientResult | BankrollInsufficientResult

export function calculateBankrollStrategy(
  balance: number,
  cyclesToSurvive: number,
): BankrollResult {
  const safeBalance = Number.isFinite(balance) && balance > 0 ? Math.floor(balance) : 0
  const minBalanceRequired = minBalanceRequiredFor(cyclesToSurvive)

  if (safeBalance < minBalanceRequired) {
    return {
      sufficient: false,
      balance: safeBalance,
      cyclesToSurvive,
      minBalanceRequired,
      missingAmount: minBalanceRequired - safeBalance,
    }
  }

  const totalRiskMultiplier = CYCLE_MULTIPLIER * cyclesToSurvive
  const rawBaseBet = safeBalance / totalRiskMultiplier
  const baseBet = roundDownToStep(rawBaseBet, MIN_BET)
  const gale1 = baseBet * GALE_MULTIPLIERS.gale1
  const gale2 = baseBet * GALE_MULTIPLIERS.gale2
  const cycleLossCost = baseBet + gale1 + gale2
  const totalLossCost = cycleLossCost * cyclesToSurvive
  const remainingBalance = safeBalance - baseBet * totalRiskMultiplier

  return {
    sufficient: true,
    balance: safeBalance,
    cyclesToSurvive,
    baseBet,
    gale1,
    gale2,
    cycleLossCost,
    totalLossCost,
    remainingBalance,
  }
}
