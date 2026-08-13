import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BacboproDashboard from '@/views/BacboproDashboard.vue'

describe('BacboproDashboard', () => {
  it('renders the header with the MKBACBO identity and no version', () => {
    const wrapper = mount(BacboproDashboard)
    expect(wrapper.text()).toContain('MKBACBO')
    expect(wrapper.text()).not.toContain('BACBOPRO')
    expect(wrapper.text()).not.toContain('V4.2')
    expect(wrapper.text()).toContain('CASINO SYNC: ACTIVO')
    expect(wrapper.text()).toContain('MKBOT. VIP')
  })

  it('renders both toggle cards with their toggles', () => {
    const wrapper = mount(BacboproDashboard)
    expect(wrapper.text()).toContain('PRUEBAS TELEGRAM')
    expect(wrapper.text()).toContain('BAC BO OFICIAL')
    const switches = wrapper.findAll('[role="switch"]')
    expect(switches).toHaveLength(2)
    expect(switches[0]?.attributes('aria-checked')).toBe('true')
    expect(switches[1]?.attributes('aria-checked')).toBe('true')
  })

  it('renders the four KPIs with the timer in mono value', () => {
    const wrapper = mount(BacboproDashboard)
    expect(wrapper.text()).toContain('WINS')
    expect(wrapper.text()).toContain('ALERTAS ENVIADAS')
    expect(wrapper.text()).toContain('LOST')
    expect(wrapper.text()).toContain('TIEMPO')
    expect(wrapper.text()).toContain('04:16:19')
  })

  it('renders the streak board as generated columns capped at 6 rows', () => {
    const wrapper = mount(BacboproDashboard)
    const columns = wrapper.findAll('.streak-column')
    expect(columns).toHaveLength(14)
    for (const column of columns) {
      const cells = column.findAll('[role="img"]')
      expect(cells.length).toBeGreaterThan(0)
      expect(cells.length).toBeLessThanOrEqual(6)
    }
  })

  it('renders the unified last plays panel as a 16x10 grid with both stats subsections', () => {
    const wrapper = mount(BacboproDashboard)
    expect(wrapper.text()).toContain('ÚLTIMAS JUGADAS')
    expect(wrapper.text()).toContain('ÚLTIMAS 200')
    expect(wrapper.text()).toContain('ÚLTIMAS 100')
    const historyCells = wrapper.findAll('[aria-label="Historial de últimas 200 jugadas"] [role="img"]')
    expect(historyCells).toHaveLength(16 * 10)
    expect(wrapper.text()).toContain('45%')
    expect(wrapper.text()).toContain('9%')
    expect(wrapper.text()).toContain('46%')
    expect(wrapper.text()).toContain('48%')
    expect(wrapper.text()).toContain('8%')
    expect(wrapper.text()).toContain('44%')
  })

  it('renders a single winner indicator with matching color and no sync section', () => {
    const wrapper = mount(BacboproDashboard)
    expect(wrapper.text()).toContain('ÚLTIMO GANADOR')
    const indicators = wrapper.findAll('[role="img"][aria-label^="Último ganador:"]')
    expect(indicators).toHaveLength(1)
    expect(indicators[0]?.attributes('aria-label')).toBe('Último ganador: BANKER')
    expect(wrapper.text()).not.toContain('SYNC CON EL CASINO')
  })

  it('renders the current operation entry with alert, game, pattern and bet info', () => {
    const wrapper = mount(BacboproDashboard)
    expect(wrapper.text()).toContain('OPERACIÓN ACTUAL')
    expect(wrapper.text()).toContain('🚨')
    expect(wrapper.text()).toContain('NUEVA ENTRADA')
    expect(wrapper.text()).toContain('🎯 JUEGO:')
    expect(wrapper.text()).toContain('Bac Bo - Evolution')
    expect(wrapper.text()).toContain('📊 PATRON:')
    expect(wrapper.text()).toContain('streak-3')
    expect(wrapper.text()).toContain('💣 INGRESAR DESPUES DE:')
    expect(wrapper.text()).toContain('🔵')
    expect(wrapper.text()).toContain('🔥 APUESTA EN:')
    expect(wrapper.text()).toContain('🔴')
    expect(wrapper.text()).toContain('🔁 MARTINGALAS MAXIMO:')
    expect(wrapper.text()).not.toContain('OBJETIVO DIARIO')
    expect(wrapper.text()).not.toContain('$5,000')
    expect(wrapper.text()).not.toContain('$1,250')
    expect(wrapper.text()).not.toContain('EN CURSO')
    expect(wrapper.text()).not.toContain('Siguiente apuesta')
    expect(wrapper.text()).not.toContain('RECOMENDACIÓN')
  })
})
