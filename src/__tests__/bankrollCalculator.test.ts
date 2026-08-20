import { describe, expect, it } from 'vitest'
import {
  MIN_BET,
  calculateBankrollStrategy,
  calculateRequiredCapital,
  minBalanceRequiredFor,
} from '@/utils/bankrollCalculator'

// El perfil "Recomendado" soporta 3 ciclos perdidos consecutivos (21x la
// apuesta base) — mismos casos obligatorios de la calculadora original.
const RECOMENDADO_CYCLES = 3

describe('minBalanceRequiredFor', () => {
  it('calcula el capital mínimo como 7x (1+2+4) por la cantidad de ciclos', () => {
    expect(minBalanceRequiredFor(3)).toBe(105_000)
    expect(minBalanceRequiredFor(4)).toBe(140_000)
    expect(minBalanceRequiredFor(2)).toBe(70_000)
  })
})

describe('calculateBankrollStrategy', () => {
  it('marca saldo insuficiente por debajo del mínimo requerido ($105.000)', () => {
    const result = calculateBankrollStrategy(100_000, RECOMENDADO_CYCLES)
    expect(result.sufficient).toBe(false)
    if (!result.sufficient) {
      expect(result.minBalanceRequired).toBe(105_000)
      expect(result.missingAmount).toBe(5_000)
    }
  })

  it('marca saldo insuficiente justo un peso por debajo del mínimo ($104.999)', () => {
    const result = calculateBankrollStrategy(104_999, RECOMENDADO_CYCLES)
    expect(result.sufficient).toBe(false)
    if (!result.sufficient) {
      expect(result.missingAmount).toBe(1)
    }
  })

  it('recomienda apuesta base de $5.000 con saldo de $105.000 (mínimo exacto)', () => {
    const result = calculateBankrollStrategy(105_000, RECOMENDADO_CYCLES)
    expect(result.sufficient).toBe(true)
    if (result.sufficient) {
      expect(result.baseBet).toBe(5_000)
      expect(result.gale1).toBe(10_000)
      expect(result.gale2).toBe(20_000)
      expect(result.remainingBalance).toBe(0)
    }
  })

  it('ejemplo 2: $200.000 → apuesta base $5.000', () => {
    const result = calculateBankrollStrategy(200_000, RECOMENDADO_CYCLES)
    expect(result.sufficient).toBe(true)
    if (result.sufficient) {
      expect(result.baseBet).toBe(5_000)
      expect(result.gale1).toBe(10_000)
      expect(result.gale2).toBe(20_000)
      expect(result.cycleLossCost).toBe(35_000)
      expect(result.totalLossCost).toBe(105_000)
    }
  })

  it('ejemplo 3: $500.000 → apuesta base $20.000, saldo restante $80.000', () => {
    const result = calculateBankrollStrategy(500_000, RECOMENDADO_CYCLES)
    expect(result.sufficient).toBe(true)
    if (result.sufficient) {
      expect(result.baseBet).toBe(20_000)
      expect(result.gale1).toBe(40_000)
      expect(result.gale2).toBe(80_000)
      expect(result.cycleLossCost).toBe(140_000)
      expect(result.totalLossCost).toBe(420_000)
      expect(result.remainingBalance).toBe(80_000)
    }
  })

  it('ejemplo 4: $1.000.000 → apuesta base $45.000, saldo restante $55.000', () => {
    const result = calculateBankrollStrategy(1_000_000, RECOMENDADO_CYCLES)
    expect(result.sufficient).toBe(true)
    if (result.sufficient) {
      expect(result.baseBet).toBe(45_000)
      expect(result.gale1).toBe(90_000)
      expect(result.gale2).toBe(180_000)
      expect(result.cycleLossCost).toBe(315_000)
      expect(result.totalLossCost).toBe(945_000)
      expect(result.remainingBalance).toBe(55_000)
    }
  })

  it('un perfil más agresivo (menos ciclos) exige menos capital y recomienda una apuesta base mayor', () => {
    const conservador = calculateBankrollStrategy(500_000, 4)
    const recomendado = calculateBankrollStrategy(500_000, 3)
    const agresivo = calculateBankrollStrategy(500_000, 2)
    expect(conservador.sufficient && conservador.baseBet).toBe(15_000)
    expect(recomendado.sufficient && recomendado.baseBet).toBe(20_000)
    expect(agresivo.sufficient && agresivo.baseBet).toBe(35_000)
  })

  it('nunca recomienda una apuesta inferior a la mínima del casino', () => {
    for (const balance of [105_000, 150_000, 500_000, 1_000_000, 10_000_000]) {
      const result = calculateBankrollStrategy(balance, RECOMENDADO_CYCLES)
      expect(result.sufficient).toBe(true)
      if (result.sufficient) {
        expect(result.baseBet).toBeGreaterThanOrEqual(MIN_BET)
        expect(result.baseBet % MIN_BET).toBe(0)
      }
    }
  })

  it('nunca produce saldos ni resultados negativos, inválidos o NaN', () => {
    for (const balance of [-500_000, 0, NaN, -1]) {
      const result = calculateBankrollStrategy(balance, RECOMENDADO_CYCLES)
      expect(result.sufficient).toBe(false)
      if (!result.sufficient) {
        expect(Number.isFinite(result.balance)).toBe(true)
        expect(result.balance).toBe(0)
        expect(result.missingAmount).toBe(105_000)
      }
    }
  })
})

describe('calculateRequiredCapital', () => {
  it('calcula el capital exacto para una apuesta base de $50.000 (perfil recomendado)', () => {
    const result = calculateRequiredCapital(50_000, RECOMENDADO_CYCLES)
    expect(result).not.toBeNull()
    expect(result?.baseBet).toBe(50_000)
    expect(result?.gale1).toBe(100_000)
    expect(result?.gale2).toBe(200_000)
    expect(result?.cycleLossCost).toBe(350_000)
    expect(result?.requiredCapital).toBe(1_050_000)
  })

  it('es el inverso exacto de calculateBankrollStrategy (round-trip)', () => {
    for (const desiredBaseBet of [5_000, 20_000, 45_000, 100_000]) {
      for (const cycles of [2, 3, 4]) {
        const required = calculateRequiredCapital(desiredBaseBet, cycles)
        expect(required).not.toBeNull()
        const back = calculateBankrollStrategy(required!.requiredCapital, cycles)
        expect(back.sufficient).toBe(true)
        if (back.sufficient) {
          expect(back.baseBet).toBe(desiredBaseBet)
          expect(back.remainingBalance).toBe(0)
        }
      }
    }
  })

  it('redondea la apuesta deseada hacia abajo a múltiplos de $5.000', () => {
    const result = calculateRequiredCapital(52_999, RECOMENDADO_CYCLES)
    expect(result?.baseBet).toBe(50_000)
  })

  it('devuelve null cuando la apuesta deseada no alcanza el mínimo del casino', () => {
    for (const desiredBaseBet of [0, -5_000, NaN, 4_999]) {
      expect(calculateRequiredCapital(desiredBaseBet, RECOMENDADO_CYCLES)).toBeNull()
    }
  })
})
