import { MIN_BET } from './bankrollCalculator'
import { roundDownToStep } from './currency'

/**
 * Perfiles de riesgo: definen tanto los límites de sesión (Stop Loss / Take
 * Profit, como % del saldo inicial) como cuántos ciclos perdidos consecutivos
 * de la estrategia 1‑2‑4 debe poder soportar la apuesta base (ver
 * `bankrollCalculator.ts`). Todo centralizado aquí para poder ajustarlo o
 * agregar perfiles personalizados en el futuro sin tocar la lógica de cálculo.
 */
export type RiskProfileId = 'conservador' | 'recomendado' | 'agresivo'

export interface RiskProfileDefinition {
  id: RiskProfileId
  label: string
  /** % entero del saldo inicial que define la pérdida máxima permitida (p. ej. 5 = 5%). */
  stopLossPct: number
  /** % entero del saldo inicial que define la ganancia objetivo (p. ej. 10 = 10%). */
  takeProfitPct: number
  /**
   * Ciclos completos perdidos (1→2→4) consecutivos que la apuesta base
   * recomendada debe poder soportar. Un perfil más agresivo soporta menos
   * ciclos (apuesta base más grande); uno conservador soporta más (apuesta
   * base más chica) — así la apuesta base queda coherente con el mismo
   * perfil que define el Stop Loss / Take Profit.
   */
  cyclesToSurvive: number
}

export const RISK_PROFILES: RiskProfileDefinition[] = [
  { id: 'conservador', label: 'Conservador', stopLossPct: 3, takeProfitPct: 5, cyclesToSurvive: 4 },
  {
    id: 'recomendado',
    label: 'Recomendado',
    stopLossPct: 5,
    takeProfitPct: 10,
    cyclesToSurvive: 3,
  },
  { id: 'agresivo', label: 'Agresivo', stopLossPct: 7, takeProfitPct: 15, cyclesToSurvive: 2 },
]

export const DEFAULT_RISK_PROFILE_ID: RiskProfileId = 'recomendado'

export function getRiskProfile(id: RiskProfileId): RiskProfileDefinition {
  return (
    RISK_PROFILES.find((profile) => profile.id === id) ??
    (RISK_PROFILES.find(
      (profile) => profile.id === DEFAULT_RISK_PROFILE_ID,
    ) as RiskProfileDefinition)
  )
}

export interface SessionLimits {
  initialBalance: number
  profile: RiskProfileDefinition
  maxLoss: number
  stopLossBalance: number
  targetGain: number
  takeProfitBalance: number
}

/** Devuelve `null` cuando el saldo inicial no es válido (vacío, cero, negativo, NaN). */
export function calculateSessionLimits(
  initialBalance: number,
  profileId: RiskProfileId,
): SessionLimits | null {
  const safeBalance =
    Number.isFinite(initialBalance) && initialBalance > 0 ? Math.floor(initialBalance) : 0
  if (safeBalance <= 0) return null

  const profile = getRiskProfile(profileId)
  // Igual que la apuesta base: se redondea siempre hacia abajo a múltiplos
  // de $5.000 — así el Stop Loss nunca deja perder más de lo calculado ni el
  // Take Profit exige más ganancia de la necesaria para cerrar la sesión.
  const maxLoss = roundDownToStep(Math.round((safeBalance * profile.stopLossPct) / 100), MIN_BET)
  const targetGain = roundDownToStep(
    Math.round((safeBalance * profile.takeProfitPct) / 100),
    MIN_BET,
  )

  return {
    initialBalance: safeBalance,
    profile,
    maxLoss,
    stopLossBalance: safeBalance - maxLoss,
    targetGain,
    takeProfitBalance: safeBalance + targetGain,
  }
}

export type SessionStatus =
  'below-stop-loss' | 'safe-zone' | 'take-profit-reached' | 'above-take-profit'

export interface SessionStatusResult {
  status: SessionStatus
  currentBalance: number
  /** Cuánto puede perder todavía antes de tocar el Stop Loss (0 si ya lo alcanzó). */
  remainingToStopLoss: number
  /** Cuánto le falta para alcanzar el Take Profit (0 si ya lo alcanzó o superó). */
  remainingToTakeProfit: number
}

export function evaluateCurrentBalance(
  currentBalance: number,
  limits: SessionLimits,
): SessionStatusResult {
  const safeCurrent = Number.isFinite(currentBalance) && currentBalance >= 0 ? currentBalance : 0

  if (safeCurrent <= limits.stopLossBalance) {
    return {
      status: 'below-stop-loss',
      currentBalance: safeCurrent,
      remainingToStopLoss: 0,
      remainingToTakeProfit: Math.max(limits.takeProfitBalance - safeCurrent, 0),
    }
  }

  if (safeCurrent === limits.takeProfitBalance) {
    return {
      status: 'take-profit-reached',
      currentBalance: safeCurrent,
      remainingToStopLoss: safeCurrent - limits.stopLossBalance,
      remainingToTakeProfit: 0,
    }
  }

  if (safeCurrent > limits.takeProfitBalance) {
    return {
      status: 'above-take-profit',
      currentBalance: safeCurrent,
      remainingToStopLoss: safeCurrent - limits.stopLossBalance,
      remainingToTakeProfit: 0,
    }
  }

  return {
    status: 'safe-zone',
    currentBalance: safeCurrent,
    remainingToStopLoss: safeCurrent - limits.stopLossBalance,
    remainingToTakeProfit: limits.takeProfitBalance - safeCurrent,
  }
}
