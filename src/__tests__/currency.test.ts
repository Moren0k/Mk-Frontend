import { describe, expect, it } from 'vitest'
import {
  formatCurrencyCOP,
  formatDigitsWithThousands,
  parseCurrencyAmount,
  roundDownToStep,
} from '@/utils/currency'

describe('parseCurrencyAmount', () => {
  it('extrae solo dígitos de texto con formato de moneda', () => {
    expect(parseCurrencyAmount('$500.000')).toBe(500_000)
    expect(parseCurrencyAmount('500,000')).toBe(500_000)
    expect(parseCurrencyAmount('500000')).toBe(500_000)
    expect(parseCurrencyAmount(' 500 000 ')).toBe(500_000)
  })

  it('devuelve 0 para campos vacíos o sin dígitos', () => {
    expect(parseCurrencyAmount('')).toBe(0)
    expect(parseCurrencyAmount('   ')).toBe(0)
    expect(parseCurrencyAmount('$')).toBe(0)
  })

  it('nunca produce negativos ni NaN, incluso con texto inválido', () => {
    expect(parseCurrencyAmount('abc')).toBe(0)
    expect(parseCurrencyAmount('-500')).toBe(500)
  })
})

describe('roundDownToStep', () => {
  it('redondea siempre hacia abajo', () => {
    expect(roundDownToStep(9_523, 5_000)).toBe(5_000)
    expect(roundDownToStep(10_000, 5_000)).toBe(10_000)
    expect(roundDownToStep(4_999, 5_000)).toBe(0)
  })
})

describe('formatDigitsWithThousands', () => {
  it('formatea en vivo con separador de miles, sin símbolo de moneda', () => {
    expect(formatDigitsWithThousands('500000')).toBe('500.000')
    expect(formatDigitsWithThousands('5')).toBe('5')
    expect(formatDigitsWithThousands('5000')).toBe('5.000')
  })

  it('ignora caracteres no numéricos y ceros a la izquierda', () => {
    expect(formatDigitsWithThousands('$1.234.567')).toBe('1.234.567')
    expect(formatDigitsWithThousands('0500000')).toBe('500.000')
  })

  it('devuelve cadena vacía para entradas vacías o sin dígitos', () => {
    expect(formatDigitsWithThousands('')).toBe('')
    expect(formatDigitsWithThousands('abc')).toBe('')
  })
})

describe('formatCurrencyCOP', () => {
  it('formatea con separador de miles y símbolo de moneda', () => {
    expect(formatCurrencyCOP(5_000)).toBe('$5.000')
    expect(formatCurrencyCOP(105_000)).toBe('$105.000')
    expect(formatCurrencyCOP(1_000_000)).toBe('$1.000.000')
  })

  it('nunca produce NaN o Infinity en el texto formateado', () => {
    expect(formatCurrencyCOP(NaN)).toBe('$0')
    expect(formatCurrencyCOP(Infinity)).toBe('$0')
    expect(formatCurrencyCOP(-Infinity)).toBe('$0')
  })
})
