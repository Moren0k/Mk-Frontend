import { describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import RiskCalculatorTool from '@/components/tools/RiskCalculatorTool.vue'
import { useBacboproStore } from '@/stores/bacbopro'

function mountTool() {
  setActivePinia(createPinia())
  const store = useBacboproStore()
  return { wrapper: mount(RiskCalculatorTool), store }
}

// El toggle "TENGO UN SALDO" / "QUIERO APOSTAR UN MONTO FIJO" también usa
// role="radio", así que los botones de perfil ya no son los primeros del
// documento — hay que buscarlos dentro de su propio radiogroup.
function profileRadios(wrapper: VueWrapper) {
  return wrapper.get('[role="radiogroup"][aria-label="Perfil de riesgo"]').findAll('button')
}

describe('RiskCalculatorTool', () => {
  it('caso 1 (perfil recomendado, por defecto): $500.000 → apuesta base $20.000 y SL/TP $475.000 / $550.000', async () => {
    const { wrapper } = mountTool()
    await wrapper.get('#risk-initial-balance').setValue('500000')

    expect(wrapper.text()).toContain('$20.000') // apuesta base
    expect(wrapper.text()).toContain('$40.000') // gale 1
    expect(wrapper.text()).toContain('$80.000') // gale 2
    expect(wrapper.text()).toContain('$475.000') // stop loss
    expect(wrapper.text()).toContain('$550.000') // take profit
  })

  it('cambiar de perfil recalcula apuesta base y SL/TP juntos y de forma coherente', async () => {
    const { wrapper } = mountTool()
    await wrapper.get('#risk-initial-balance').setValue('500000')

    const [conservador, , agresivo] = profileRadios(wrapper)

    await conservador!.trigger('click')
    expect(wrapper.text()).toContain('$15.000') // apuesta base conservadora
    expect(wrapper.text()).toContain('$485.000') // SL conservador
    expect(wrapper.text()).toContain('$525.000') // TP conservador

    await agresivo!.trigger('click')
    expect(wrapper.text()).toContain('$35.000') // apuesta base agresiva
    expect(wrapper.text()).toContain('$465.000') // SL agresivo
    expect(wrapper.text()).toContain('$575.000') // TP agresivo
  })

  it('detecta los 4 estados de seguimiento con el saldo actual', async () => {
    const { wrapper } = mountTool()
    await wrapper.get('#risk-initial-balance').setValue('500000')
    const currentInput = wrapper.get('#risk-current-balance')

    await currentInput.setValue('400000')
    expect(wrapper.text()).toContain('LÍMITE DE PÉRDIDA ALCANZADO')

    await currentInput.setValue('500000')
    expect(wrapper.text()).toContain('SIGUES DENTRO DE TU PLAN')

    await currentInput.setValue('550000')
    expect(wrapper.text()).toContain('OBJETIVO DE GANANCIA ALCANZADO')

    await currentInput.setValue('600000')
    expect(wrapper.text()).toContain('OBJETIVO SUPERADO')
  })

  it('muestra el contexto del sistema con datos reales del store (no un snapshot fijo)', async () => {
    const { wrapper, store } = mountTool()
    store.summary = { uptimeMs: 0, oficial: { won: 87, lost: 10, alertsSent: 5 } }
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('89,69%')
    expect(wrapper.text()).toContain('97') // total de operaciones
    expect(wrapper.text()).toContain('87')
    expect(wrapper.text()).toContain('10')
  })

  it('muestra un estado neutro de contexto cuando aún no hay datos del store', () => {
    const { wrapper } = mountTool()
    expect(wrapper.text()).toContain('Aún no hay estadísticas disponibles')
  })

  it('formatea el saldo con separador de miles en vivo mientras se escribe', async () => {
    const { wrapper } = mountTool()
    const input = wrapper.get('#risk-initial-balance')

    await input.setValue('5')
    expect((input.element as HTMLInputElement).value).toBe('5')

    await input.setValue('500000')
    expect((input.element as HTMLInputElement).value).toBe('500.000')
  })

  it('redondea el Stop Loss y el Take Profit a múltiplos de $5.000 con un saldo no redondo', async () => {
    const { wrapper } = mountTool()
    await wrapper.get('#risk-initial-balance').setValue('333000')
    const [, , agresivo] = profileRadios(wrapper)
    await agresivo!.trigger('click')

    // Bruto: SL 333.000*7% = 23.310 → 20.000; TP 333.000*15% = 49.950 → 45.000
    expect(wrapper.text()).toContain('$313.000') // saldo límite de stop loss
    expect(wrapper.text()).toContain('$378.000') // saldo objetivo de take profit
  })

  it('nunca rompe con saldo vacío, cero o inválido', async () => {
    const { wrapper } = mountTool()
    const input = wrapper.get('#risk-initial-balance')

    await input.setValue('0')
    expect(wrapper.text()).not.toContain('NaN')
    expect(wrapper.text()).not.toContain('Infinity')

    await input.setValue('abc')
    expect(wrapper.text()).not.toContain('NaN')
  })

  describe('modo invertido: "quiero apostar un monto fijo"', () => {
    async function switchToBetMode(wrapper: VueWrapper): Promise<void> {
      const modeButtons = wrapper.findAll(
        '[role="radiogroup"][aria-label="Modo de cálculo"] button',
      )
      await modeButtons[1]!.trigger('click')
    }

    it('$50.000 de apuesta (perfil recomendado) → capital $1.050.000', async () => {
      const { wrapper } = mountTool()
      await switchToBetMode(wrapper)
      await wrapper.get('#risk-desired-bet').setValue('50000')

      expect(wrapper.text()).toContain('CAPITAL QUE NECESITAS')
      expect(wrapper.text()).toContain('$1.050.000') // capital requerido
      expect(wrapper.text()).toContain('$100.000') // gale 1
      expect(wrapper.text()).toContain('$200.000') // gale 2
      // El Stop Loss / Take Profit se calculan sobre el capital requerido:
      // SL 5% de 1.050.000 = 52.500 → redondeado a 50.000 → saldo $1.000.000
      // TP 10% de 1.050.000 = 105.000 (ya múltiplo de 5.000) → $1.155.000
      expect(wrapper.text()).toContain('$1.000.000') // stop loss
      expect(wrapper.text()).toContain('$1.155.000') // take profit
    })

    it('es el inverso exacto del modo saldo (round-trip)', async () => {
      const { wrapper } = mountTool()
      await switchToBetMode(wrapper)
      await wrapper.get('#risk-desired-bet').setValue('50000')
      expect(wrapper.text()).toContain('$1.050.000')

      const modeButtons = wrapper.findAll(
        '[role="radiogroup"][aria-label="Modo de cálculo"] button',
      )
      await modeButtons[0]!.trigger('click')
      await wrapper.get('#risk-initial-balance').setValue('1050000')

      expect(wrapper.text()).toContain('TU APUESTA BASE MÁXIMA RECOMENDADA')
      expect(wrapper.text()).toContain('$50.000')
      expect(wrapper.text()).toContain('Saldo estimado tras 3 ciclos perdidos')
      expect(wrapper.text()).toContain('$0') // sin margen: el capital es justo el necesario
    })

    it('nunca muestra una apuesta inferior al mínimo del casino', async () => {
      const { wrapper } = mountTool()
      await switchToBetMode(wrapper)
      const input = wrapper.get('#risk-desired-bet')

      await input.setValue('3000')
      expect(wrapper.text()).toContain('al menos $5.000')
      expect(wrapper.text()).not.toContain('CAPITAL QUE NECESITAS')

      await input.setValue('0')
      expect(wrapper.text()).not.toContain('CAPITAL QUE NECESITAS')
      expect(wrapper.text()).not.toContain('NaN')
    })

    it('cambiar de perfil recalcula el capital requerido de forma coherente', async () => {
      const { wrapper } = mountTool()
      await switchToBetMode(wrapper)
      await wrapper.get('#risk-desired-bet').setValue('50000')

      const [conservador] = profileRadios(wrapper)
      await conservador!.trigger('click')

      // Conservador soporta 4 ciclos: (50.000+100.000+200.000) * 4 = 1.400.000
      expect(wrapper.text()).toContain('$1.400.000')
    })
  })
})
