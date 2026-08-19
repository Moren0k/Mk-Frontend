/** Extrae solo dígitos del texto ingresado (soporta "$", ".", "," y espacios como separadores). */
export function parseCurrencyAmount(rawValue: string): number {
  const digitsOnly = rawValue.replace(/\D/g, '')
  if (digitsOnly === '') return 0
  return Number(digitsOnly)
}

export function roundDownToStep(value: number, step: number): number {
  if (!Number.isFinite(value) || step <= 0) return 0
  return Math.floor(value / step) * step
}

/** Formatea como moneda colombiana sin decimales, p. ej. 105000 → "$105.000". */
export function formatCurrencyCOP(value: number): string {
  const safeValue = Number.isFinite(value) ? Math.round(value) : 0
  const sign = safeValue < 0 ? '-' : ''
  const digits = Math.abs(safeValue)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${sign}$${digits}`
}

/**
 * Formatea el texto de un input en vivo: limpia todo lo que no sea dígito,
 * quita ceros a la izquierda y aplica separador de miles — sin símbolo de
 * moneda, para usar directamente como `value` del campo mientras se escribe.
 */
export function formatDigitsWithThousands(rawValue: string): string {
  const digitsOnly = rawValue.replace(/\D/g, '').replace(/^0+(?=\d)/, '')
  if (digitsOnly === '') return ''
  return digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
