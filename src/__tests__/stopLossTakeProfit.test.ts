import { describe, expect, it } from 'vitest'
import {
  DEFAULT_RISK_PROFILE_ID,
  RISK_PROFILES,
  calculateSessionLimits,
  evaluateCurrentBalance,
  getRiskProfile,
} from '@/utils/stopLossTakeProfit'

describe('getRiskProfile', () => {
  it('el perfil recomendado es 5% SL / 10% TP, soporta 3 ciclos y es el perfil por defecto', () => {
    const profile = getRiskProfile(DEFAULT_RISK_PROFILE_ID)
    expect(profile.id).toBe('recomendado')
    expect(profile.stopLossPct).toBe(5)
    expect(profile.takeProfitPct).toBe(10)
    expect(profile.cyclesToSurvive).toBe(3)
  })

  it('expone los 3 perfiles: conservador, recomendado y agresivo', () => {
    expect(RISK_PROFILES.map((p) => p.id)).toEqual(['conservador', 'recomendado', 'agresivo'])
  })

  it('un perfil más agresivo soporta menos ciclos (apuesta base coherente con más riesgo)', () => {
    const conservador = getRiskProfile('conservador')
    const recomendado = getRiskProfile('recomendado')
    const agresivo = getRiskProfile('agresivo')
    expect(conservador.cyclesToSurvive).toBeGreaterThan(recomendado.cyclesToSurvive)
    expect(recomendado.cyclesToSurvive).toBeGreaterThan(agresivo.cyclesToSurvive)
  })
})

describe('calculateSessionLimits', () => {
  it('caso 1 (obligatorio): $500.000 con perfil recomendado', () => {
    const limits = calculateSessionLimits(500_000, 'recomendado')
    expect(limits).not.toBeNull()
    expect(limits?.maxLoss).toBe(25_000)
    expect(limits?.stopLossBalance).toBe(475_000)
    expect(limits?.targetGain).toBe(50_000)
    expect(limits?.takeProfitBalance).toBe(550_000)
  })

  it('caso 2 (obligatorio): $500.000 con perfil conservador', () => {
    const limits = calculateSessionLimits(500_000, 'conservador')
    expect(limits?.maxLoss).toBe(15_000)
    expect(limits?.stopLossBalance).toBe(485_000)
    expect(limits?.targetGain).toBe(25_000)
    expect(limits?.takeProfitBalance).toBe(525_000)
  })

  it('caso 3 (obligatorio): $500.000 con perfil agresivo', () => {
    const limits = calculateSessionLimits(500_000, 'agresivo')
    expect(limits?.maxLoss).toBe(35_000)
    expect(limits?.stopLossBalance).toBe(465_000)
    expect(limits?.targetGain).toBe(75_000)
    expect(limits?.takeProfitBalance).toBe(575_000)
  })

  it('redondea el Stop Loss y el Take Profit hacia abajo a múltiplos de $5.000 con saldos no redondos', () => {
    const limits = calculateSessionLimits(333_000, 'agresivo')
    expect(limits).not.toBeNull()
    // Bruto: maxLoss 333.000*7% = 23.310 → 20.000; targetGain 333.000*15% = 49.950 → 45.000
    expect(limits?.maxLoss).toBe(20_000)
    expect(limits?.stopLossBalance).toBe(313_000)
    expect(limits?.targetGain).toBe(45_000)
    expect(limits?.takeProfitBalance).toBe(378_000)
  })

  it('el maxLoss y el targetGain siempre son múltiplos exactos de $5.000', () => {
    for (const balance of [123_456, 87_000, 999_999, 250_001]) {
      for (const profileId of ['conservador', 'recomendado', 'agresivo'] as const) {
        const limits = calculateSessionLimits(balance, profileId)
        expect(limits).not.toBeNull()
        expect(limits!.maxLoss % 5_000).toBe(0)
        expect(limits!.targetGain % 5_000).toBe(0)
      }
    }
  })

  it('devuelve null para saldo vacío, cero, negativo o inválido', () => {
    for (const balance of [0, -500_000, NaN, -1]) {
      expect(calculateSessionLimits(balance, 'recomendado')).toBeNull()
    }
  })

  it('nunca produce límites negativos, Infinity o NaN', () => {
    const limits = calculateSessionLimits(1_000_000, 'agresivo')
    expect(limits).not.toBeNull()
    if (limits) {
      expect(Number.isFinite(limits.stopLossBalance)).toBe(true)
      expect(Number.isFinite(limits.takeProfitBalance)).toBe(true)
      expect(limits.stopLossBalance).toBeGreaterThan(0)
      expect(limits.takeProfitBalance).toBeGreaterThan(limits.initialBalance)
    }
  })
})

describe('evaluateCurrentBalance', () => {
  const limits = calculateSessionLimits(500_000, 'recomendado')!

  it('marca "below-stop-loss" cuando el saldo actual llega o supera el límite de pérdida', () => {
    expect(evaluateCurrentBalance(475_000, limits).status).toBe('below-stop-loss')
    expect(evaluateCurrentBalance(400_000, limits).status).toBe('below-stop-loss')
  })

  it('marca "safe-zone" dentro del rango y calcula lo que falta para cada límite', () => {
    const result = evaluateCurrentBalance(500_000, limits)
    expect(result.status).toBe('safe-zone')
    expect(result.remainingToStopLoss).toBe(25_000)
    expect(result.remainingToTakeProfit).toBe(50_000)
  })

  it('marca "take-profit-reached" exactamente en el saldo objetivo', () => {
    expect(evaluateCurrentBalance(550_000, limits).status).toBe('take-profit-reached')
  })

  it('marca "above-take-profit" por encima del saldo objetivo', () => {
    expect(evaluateCurrentBalance(600_000, limits).status).toBe('above-take-profit')
  })

  it('nunca produce NaN ni estados inválidos con entradas negativas o NaN', () => {
    const result = evaluateCurrentBalance(NaN, limits)
    expect(Number.isFinite(result.currentBalance)).toBe(true)
    expect(result.status).toBe('below-stop-loss')
  })
})
