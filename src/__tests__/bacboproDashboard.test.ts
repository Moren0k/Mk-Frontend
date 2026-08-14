import { describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
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

  it('renders one strategy selector inside each toggle card and no global selector', () => {
    const wrapper = mount(BacboproDashboard)
    expect(wrapper.text()).toContain('ESTRATEGIA')

    const selects = wrapper.findAll('select')
    expect(selects).toHaveLength(2)

    const telegramSelect = wrapper.find('[aria-label="Seleccionar estrategia de PRUEBAS TELEGRAM"]')
    const officialSelect = wrapper.find('[aria-label="Seleccionar estrategia de BAC BO OFICIAL"]')
    expect(telegramSelect.exists()).toBe(true)
    expect(officialSelect.exists()).toBe(true)

    expect(telegramSelect.findAll('option')).toHaveLength(3)
    expect(officialSelect.findAll('option')).toHaveLength(3)

    const toggleGrid = wrapper.find('aside [class*="grid-cols-2"]')
    expect(toggleGrid.exists()).toBe(true)
    expect(toggleGrid.findAll('select')).toHaveLength(2)
    expect(toggleGrid.findAll('[aria-label="Selector de estrategia"]')).toHaveLength(2)
  })

  describe('strategy confirmation flow', () => {
    function telegramSelectOf(wrapper: VueWrapper) {
      return wrapper.find('[aria-label="Seleccionar estrategia de PRUEBAS TELEGRAM"]')
    }

    function officialSelectOf(wrapper: VueWrapper) {
      return wrapper.find('[aria-label="Seleccionar estrategia de BAC BO OFICIAL"]')
    }

    function strategySections(wrapper: VueWrapper) {
      return wrapper.findAll('[aria-label="Selector de estrategia"]')
    }

    function buttonByText(section: ReturnType<VueWrapper['findAll']>[number], text: string) {
      return section.findAll('button').find((button) => button.text() === text)
    }

    function selectValue(select: ReturnType<VueWrapper['find']>): string {
      return (select.element as HTMLSelectElement).value
    }

    it('changing the select does not apply the strategy immediately', async () => {
      const wrapper = mount(BacboproDashboard)
      const telegramSelect = telegramSelectOf(wrapper)
      await telegramSelect.setValue('estrategia-3')

      expect(selectValue(telegramSelect)).toBe('estrategia-3')
      const telegramSection = strategySections(wrapper)[0]!
      expect(telegramSection.text()).toContain('CAMBIO PENDIENTE')
      expect(buttonByText(telegramSection, 'GUARDAR')).toBeTruthy()
      expect(buttonByText(telegramSection, 'CANCELAR')).toBeTruthy()
      expect(telegramSection.text()).not.toContain('¿CONFIRMAR CAMBIO DE ESTRATEGIA?')
      expect(selectValue(officialSelectOf(wrapper))).toBe('estrategia-2')
    })

    it('CANCELAR restores the active strategy and clears the pending change', async () => {
      const wrapper = mount(BacboproDashboard)
      const telegramSelect = telegramSelectOf(wrapper)
      await telegramSelect.setValue('estrategia-3')

      const telegramSection = strategySections(wrapper)[0]!
      const cancelButton = buttonByText(telegramSection, 'CANCELAR')
      expect(cancelButton).toBeTruthy()
      if (cancelButton) await cancelButton.trigger('click')

      expect(selectValue(telegramSelect)).toBe('estrategia-1')
      expect(telegramSection.text()).not.toContain('CAMBIO PENDIENTE')
      expect(buttonByText(telegramSection, 'GUARDAR')).toBeFalsy()
      expect(buttonByText(telegramSection, 'CANCELAR')).toBeFalsy()
    })

    it('GUARDAR shows the confirmation step without applying the change', async () => {
      const wrapper = mount(BacboproDashboard)
      const telegramSelect = telegramSelectOf(wrapper)
      await telegramSelect.setValue('estrategia-3')

      const telegramSection = strategySections(wrapper)[0]!
      const saveButton = buttonByText(telegramSection, 'GUARDAR')
      expect(saveButton).toBeTruthy()
      if (saveButton) await saveButton.trigger('click')

      expect(telegramSection.text()).toContain('¿CONFIRMAR CAMBIO DE ESTRATEGIA?')
      expect(telegramSection.text()).toContain('Estrategia 1 → Estrategia 3')
      expect(buttonByText(telegramSection, 'CONFIRMAR')).toBeTruthy()
      expect(buttonByText(telegramSection, 'CANCELAR')).toBeTruthy()
      expect(selectValue(officialSelectOf(wrapper))).toBe('estrategia-2')
    })

    it('CONFIRMAR applies the new strategy and closes the pending state', async () => {
      const wrapper = mount(BacboproDashboard)
      const telegramSelect = telegramSelectOf(wrapper)
      await telegramSelect.setValue('estrategia-3')

      const telegramSection = strategySections(wrapper)[0]!
      const saveButton = buttonByText(telegramSection, 'GUARDAR')
      if (saveButton) await saveButton.trigger('click')
      const confirmButton = buttonByText(telegramSection, 'CONFIRMAR')
      expect(confirmButton).toBeTruthy()
      if (confirmButton) await confirmButton.trigger('click')

      expect(selectValue(telegramSelect)).toBe('estrategia-3')
      expect(telegramSection.text()).not.toContain('CAMBIO PENDIENTE')
      expect(telegramSection.text()).not.toContain('¿CONFIRMAR CAMBIO DE ESTRATEGIA?')
      expect(buttonByText(telegramSection, 'GUARDAR')).toBeFalsy()
    })

    it('CANCELAR in the confirmation keeps the previous strategy', async () => {
      const wrapper = mount(BacboproDashboard)
      const telegramSelect = telegramSelectOf(wrapper)
      await telegramSelect.setValue('estrategia-3')

      const telegramSection = strategySections(wrapper)[0]!
      const saveButton = buttonByText(telegramSection, 'GUARDAR')
      if (saveButton) await saveButton.trigger('click')
      const confirmCancelButton = buttonByText(telegramSection, 'CANCELAR')
      expect(confirmCancelButton).toBeTruthy()
      if (confirmCancelButton) await confirmCancelButton.trigger('click')

      expect(selectValue(telegramSelect)).toBe('estrategia-1')
      expect(telegramSection.text()).not.toContain('CAMBIO PENDIENTE')
      expect(telegramSection.text()).not.toContain('¿CONFIRMAR CAMBIO DE ESTRATEGIA?')
    })

    it('selecting the same strategy does not trigger confirmation', async () => {
      const wrapper = mount(BacboproDashboard)
      const telegramSelect = telegramSelectOf(wrapper)
      await telegramSelect.setValue('estrategia-1')

      const telegramSection = strategySections(wrapper)[0]!
      expect(telegramSection.text()).not.toContain('CAMBIO PENDIENTE')
      expect(buttonByText(telegramSection, 'GUARDAR')).toBeFalsy()
      expect(buttonByText(telegramSection, 'CANCELAR')).toBeFalsy()
    })

    it('Telegram and Bac Bo keep independent states through the full flow', async () => {
      const wrapper = mount(BacboproDashboard)

      const telegramSection = strategySections(wrapper)[0]!
      const officialSection = strategySections(wrapper)[1]!

      const telegramSelect = telegramSelectOf(wrapper)
      await telegramSelect.setValue('estrategia-3')
      const telegramSave = buttonByText(telegramSection, 'GUARDAR')
      if (telegramSave) await telegramSave.trigger('click')
      const telegramConfirm = buttonByText(telegramSection, 'CONFIRMAR')
      if (telegramConfirm) await telegramConfirm.trigger('click')

      expect(selectValue(telegramSelect)).toBe('estrategia-3')
      expect(selectValue(officialSelectOf(wrapper))).toBe('estrategia-2')

      const officialSelect = officialSelectOf(wrapper)
      await officialSelect.setValue('estrategia-1')
      const officialSave = buttonByText(officialSection, 'GUARDAR')
      if (officialSave) await officialSave.trigger('click')
      const officialConfirm = buttonByText(officialSection, 'CONFIRMAR')
      if (officialConfirm) await officialConfirm.trigger('click')

      expect(selectValue(officialSelect)).toBe('estrategia-1')
      expect(selectValue(telegramSelect)).toBe('estrategia-3')
    })

    it('toggling ON/OFF does not change the strategy', async () => {
      const wrapper = mount(BacboproDashboard)
      const telegramSelect = telegramSelectOf(wrapper)
      const switches = wrapper.findAll('[role="switch"]')

      await switches[0]?.trigger('click')
      expect(selectValue(telegramSelect)).toBe('estrategia-1')

      await switches[0]?.trigger('click')
      expect(selectValue(telegramSelect)).toBe('estrategia-1')

      const telegramSection = strategySections(wrapper)[0]!
      expect(telegramSection.text()).not.toContain('CAMBIO PENDIENTE')
    })

    it('does not use window.confirm', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
      const wrapper = mount(BacboproDashboard)

      const telegramSelect = telegramSelectOf(wrapper)
      await telegramSelect.setValue('estrategia-3')
      const telegramSection = strategySections(wrapper)[0]!
      const saveButton = buttonByText(telegramSection, 'GUARDAR')
      if (saveButton) await saveButton.trigger('click')
      const confirmButton = buttonByText(telegramSection, 'CONFIRMAR')
      if (confirmButton) await confirmButton.trigger('click')

      expect(selectValue(telegramSelect)).toBe('estrategia-3')
      expect(confirmSpy).not.toHaveBeenCalled()
      confirmSpy.mockRestore()
    })
  })

  describe('channel state confirmation flow', () => {
    function cardOf(wrapper: VueWrapper, title: string) {
      return wrapper.find(`[aria-label="${title}"]`)
    }

    function switchOf(wrapper: VueWrapper, title: string) {
      return wrapper.find(`[aria-label="Activar ${title}"]`)
    }

    async function changeStateAndConfirm(wrapper: VueWrapper, title: string) {
      const card = cardOf(wrapper, title)
      const toggle = switchOf(wrapper, title)
      await toggle.trigger('click')
      const save = card.find('[aria-label="Guardar cambio de estado"]')
      if (save.exists()) await save.trigger('click')
      const confirm = card.find('[aria-label="Confirmar cambio de estado"]')
      if (confirm.exists()) await confirm.trigger('click')
      return toggle
    }

    it('clicking the switch does not change the active state immediately', async () => {
      const wrapper = mount(BacboproDashboard)
      const telegramCard = cardOf(wrapper, 'PRUEBAS TELEGRAM')
      const telegramSwitch = switchOf(wrapper, 'PRUEBAS TELEGRAM')

      await telegramSwitch.trigger('click')

      expect(telegramSwitch.attributes('aria-checked')).toBe('false')
      expect(telegramCard.text()).toContain('CAMBIO DE ESTADO PENDIENTE')
      expect(telegramCard.find('[aria-label="Guardar cambio de estado"]').exists()).toBe(true)
      expect(telegramCard.find('[aria-label="Cancelar cambio de estado"]').exists()).toBe(true)
      expect(telegramCard.text()).not.toContain('¿CONFIRMAR CAMBIO DE ESTADO?')
    })

    it('CANCELAR restores the original state', async () => {
      const wrapper = mount(BacboproDashboard)
      const telegramCard = cardOf(wrapper, 'PRUEBAS TELEGRAM')
      const telegramSwitch = switchOf(wrapper, 'PRUEBAS TELEGRAM')

      await telegramSwitch.trigger('click')
      const cancel = telegramCard.find('[aria-label="Cancelar cambio de estado"]')
      await cancel.trigger('click')

      expect(telegramSwitch.attributes('aria-checked')).toBe('true')
      expect(telegramCard.text()).not.toContain('CAMBIO DE ESTADO PENDIENTE')
      expect(telegramCard.text()).not.toContain('¿CONFIRMAR CAMBIO DE ESTADO?')
    })

    it('GUARDAR opens the confirmation without applying the change', async () => {
      const wrapper = mount(BacboproDashboard)
      const telegramCard = cardOf(wrapper, 'PRUEBAS TELEGRAM')
      const telegramSwitch = switchOf(wrapper, 'PRUEBAS TELEGRAM')

      await telegramSwitch.trigger('click')
      const save = telegramCard.find('[aria-label="Guardar cambio de estado"]')
      await save.trigger('click')

      expect(telegramCard.text()).toContain('¿CONFIRMAR CAMBIO DE ESTADO?')
      expect(telegramCard.text()).toContain('ON → OFF')
      expect(telegramCard.find('[aria-label="Confirmar cambio de estado"]').exists()).toBe(true)
      expect(telegramCard.find('[aria-label="Cancelar confirmación de estado"]').exists()).toBe(
        true,
      )
    })

    it('CONFIRMAR applies the new state and closes the pending flow', async () => {
      const wrapper = mount(BacboproDashboard)
      const telegramCard = cardOf(wrapper, 'PRUEBAS TELEGRAM')
      const telegramSwitch = await changeStateAndConfirm(wrapper, 'PRUEBAS TELEGRAM')

      expect(telegramSwitch.attributes('aria-checked')).toBe('false')
      expect(telegramCard.text()).not.toContain('CAMBIO DE ESTADO PENDIENTE')
      expect(telegramCard.text()).not.toContain('¿CONFIRMAR CAMBIO DE ESTADO?')
    })

    it('CANCELAR in the confirmation keeps the previous state', async () => {
      const wrapper = mount(BacboproDashboard)
      const telegramCard = cardOf(wrapper, 'PRUEBAS TELEGRAM')
      const telegramSwitch = switchOf(wrapper, 'PRUEBAS TELEGRAM')

      await telegramSwitch.trigger('click')
      const save = telegramCard.find('[aria-label="Guardar cambio de estado"]')
      await save.trigger('click')
      const confirmCancel = telegramCard.find('[aria-label="Cancelar confirmación de estado"]')
      await confirmCancel.trigger('click')

      expect(telegramSwitch.attributes('aria-checked')).toBe('true')
      expect(telegramCard.text()).not.toContain('CAMBIO DE ESTADO PENDIENTE')
      expect(telegramCard.text()).not.toContain('¿CONFIRMAR CAMBIO DE ESTADO?')
    })

    it('OFF to ON requires confirmation too', async () => {
      const wrapper = mount(BacboproDashboard)
      const telegramCard = cardOf(wrapper, 'PRUEBAS TELEGRAM')
      const telegramSwitch = await changeStateAndConfirm(wrapper, 'PRUEBAS TELEGRAM')
      expect(telegramSwitch.attributes('aria-checked')).toBe('false')

      await telegramSwitch.trigger('click')
      const save = telegramCard.find('[aria-label="Guardar cambio de estado"]')
      await save.trigger('click')
      expect(telegramCard.text()).toContain('OFF → ON')

      const confirm = telegramCard.find('[aria-label="Confirmar cambio de estado"]')
      await confirm.trigger('click')
      expect(telegramSwitch.attributes('aria-checked')).toBe('true')
    })

    it('Telegram and Bac Bo keep independent states', async () => {
      const wrapper = mount(BacboproDashboard)
      await changeStateAndConfirm(wrapper, 'PRUEBAS TELEGRAM')

      const officialSwitch = switchOf(wrapper, 'BAC BO OFICIAL')
      const officialCard = cardOf(wrapper, 'BAC BO OFICIAL')
      expect(officialSwitch.attributes('aria-checked')).toBe('true')
      expect(officialCard.text()).not.toContain('CAMBIO DE ESTADO PENDIENTE')
    })

    it('changing ON/OFF does not modify the strategy', async () => {
      const wrapper = mount(BacboproDashboard)
      const telegramSelect = wrapper.find('[aria-label="Seleccionar estrategia de PRUEBAS TELEGRAM"]')

      await changeStateAndConfirm(wrapper, 'PRUEBAS TELEGRAM')

      expect((telegramSelect.element as HTMLSelectElement).value).toBe('estrategia-1')
    })

    it('changing the strategy does not modify ON/OFF', async () => {
      const wrapper = mount(BacboproDashboard)
      const telegramSwitch = switchOf(wrapper, 'PRUEBAS TELEGRAM')
      const telegramSelect = wrapper.find('[aria-label="Seleccionar estrategia de PRUEBAS TELEGRAM"]')

      await telegramSelect.setValue('estrategia-3')
      expect(telegramSwitch.attributes('aria-checked')).toBe('true')

      const telegramSection = wrapper.findAll('[aria-label="Selector de estrategia"]')[0]!
      const save = telegramSection.findAll('button').find((button) => button.text() === 'GUARDAR')
      if (save) await save.trigger('click')
      const confirm = telegramSection.findAll('button').find((button) => button.text() === 'CONFIRMAR')
      if (confirm) await confirm.trigger('click')

      expect(telegramSwitch.attributes('aria-checked')).toBe('true')
      expect((telegramSelect.element as HTMLSelectElement).value).toBe('estrategia-3')
    })

    it('does not use window.confirm for state changes', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
      const wrapper = mount(BacboproDashboard)

      await changeStateAndConfirm(wrapper, 'PRUEBAS TELEGRAM')

      expect(confirmSpy).not.toHaveBeenCalled()
      confirmSpy.mockRestore()
    })
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
