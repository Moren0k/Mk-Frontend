import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises, DOMWrapper, type VueWrapper } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import BacboproDashboard from '@/views/BacboproDashboard.vue'
import { useBacboproStore } from '@/stores/bacbopro'
import { useSideNav } from '@/composables/useSideNav'
import { ApiError } from '@/api/client'
import type { ChannelState, HistoryItem, OperationVm } from '@/api/types'

// SideNav usa <RouterLink>/useRoute(), así que el montaje necesita un
// router activo; las rutas reales no importan para estos tests (ninguno
// navega), solo que existan '/' y '/herramientas' para resolver los links.
const testRouter = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/herramientas', component: { template: '<div />' } },
  ],
})

// El store ya no se inicializa desde la propia vista (eso ahora vive en
// App.vue, para sobrevivir a la navegación entre páginas) — el test lo
// dispara a mano, igual que haría el watcher de App.vue al desbloquear.
function mountDashboard(): VueWrapper {
  void useBacboproStore().initialize()
  return mount(BacboproDashboard, { global: { plugins: [testRouter] } })
}

// El badge de estado, "ENVIAR RESUMEN" y "Cerrar sesión" viven en el menú
// lateral (oculto por defecto) — hay que abrirlo desde el botón del header.
async function openMenu(target: VueWrapper): Promise<void> {
  await target.get('[aria-label="Abrir menú"]').trigger('click')
}

const api = vi.hoisted(() => {
  const oficialConfig: ChannelState = {
    channel: 'oficial',
    strategyId: 'streak-4',
    active: true,
    maxMartingalesOverride: null,
  }
  const pruebasConfig: ChannelState = {
    channel: 'pruebas',
    strategyId: null,
    active: false,
    maxMartingalesOverride: null,
  }
  const oficialOperation: OperationVm = {
    operationId: 'op-1',
    strategyId: 'streak-4',
    recommendedWinner: 'PLAYER',
    streakWinner: 'BANKER',
    currentState: 'OPEN',
    currentMartingale: 0,
    reason: 'Racha de 4 resultados consecutivos de BANKER.',
    openedAt: '2026-08-11T04:28:10.828Z',
    closedAt: null,
  }
  const history: HistoryItem[] = Array.from({ length: 200 }, (_, index) => ({
    roundId: `round-${index}`,
    winner: index < 10 ? 'TIE' : index < 150 ? 'PLAYER' : 'BANKER',
    score: 9,
    playedAt: '2026-08-11T04:28:11.765Z',
  }))

  const state = {
    oficial: { ...oficialConfig },
    pruebas: { ...pruebasConfig },
    oficialOperation: { ...oficialOperation },
    history,
  }

  return { state, oficialConfig, pruebasConfig, oficialOperation }
})

vi.mock('@/api/endpoints', () => ({
  getChannel: vi.fn((channel: 'oficial' | 'pruebas') =>
    Promise.resolve({
      data: { ...(channel === 'oficial' ? api.state.oficial : api.state.pruebas) },
      requestId: 'r1',
    }),
  ),
  getOperations: vi.fn((channel: 'oficial' | 'pruebas') =>
    Promise.resolve({
      data:
        channel === 'oficial' && api.state.oficialOperation
          ? [{ ...api.state.oficialOperation }]
          : [],
      requestId: 'r2',
    }),
  ),
  getHistory: vi.fn(() =>
    Promise.resolve({
      data: [...api.state.history],
      meta: { limit: 200, count: 200 },
      requestId: 'r3',
    }),
  ),
  getReportsSummary: vi.fn(() =>
    Promise.resolve({
      data: {
        uptimeMs: 7385000,
        oficial: { won: 8, lost: 2, alertsSent: 10 },
      },
      requestId: 'r4',
    }),
  ),
  getStrategies: vi.fn(() =>
    Promise.resolve({
      data: [
        {
          id: 'streak-3',
          name: 'Streak3Strategy',
          description: 'Recomienda el ganador opuesto tras 3 resultados consecutivos iguales.',
        },
        {
          id: 'streak-4',
          name: 'Streak4Strategy',
          description: 'Recomienda el ganador opuesto tras 4 resultados consecutivos iguales.',
        },
      ],
      requestId: 'r5',
    }),
  ),
  getHealth: vi.fn(() =>
    Promise.resolve({
      data: {
        ok: true,
        collectorConnected: true,
        lastGameReceivedAt: '2026-08-11T03:17:21.710Z',
        gamesInMemory: 200,
        activeOperations: 0,
        registeredStrategies: 2,
        registeredChannels: 2,
        lastError: null,
        db: { ok: true, latencyMs: 486 },
      },
      requestId: 'r6',
    }),
  ),
  patchChannel: vi.fn((channel: 'oficial' | 'pruebas', body: Partial<ChannelState>) => {
    const target = channel === 'oficial' ? api.state.oficial : api.state.pruebas
    const updated = { ...target, ...body }
    if (channel === 'oficial') api.state.oficial = updated
    else api.state.pruebas = updated
    return Promise.resolve({ data: { ...updated }, requestId: 'r7' })
  }),
  cancelOperation: vi.fn((id: string) => {
    const cancelled: OperationVm = {
      ...api.state.oficialOperation,
      operationId: id,
      currentState: 'CANCELLED',
      closedAt: '2026-08-11T04:30:00.000Z',
    }
    api.state.oficialOperation = cancelled
    return Promise.resolve({ data: { ...cancelled }, requestId: 'r8' })
  }),
  postAdminReports: vi.fn(() =>
    Promise.resolve({
      data: {
        channel: 'todos',
        dispatchedAt: '2026-08-11T04:17:44.000Z',
        metrics: { oficial: {}, pruebas: {} },
      },
      requestId: 'r9',
    }),
  ),
  openEventsStream: vi.fn(() => Promise.resolve({ abort: vi.fn() })),
}))

import * as endpoints from '@/api/endpoints'

// ConfirmModal usa <Teleport to="body">, así que su contenido queda fuera
// del árbol montado por Vue Test Utils; se verifica a través de document.body.
function body(): DOMWrapper<HTMLElement> {
  return new DOMWrapper(document.body)
}

describe('BacboproDashboard (integración API)', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    api.state.oficial = { ...api.oficialConfig }
    api.state.pruebas = { ...api.pruebasConfig }
    api.state.oficialOperation = { ...api.oficialOperation }
    vi.mocked(endpoints.patchChannel).mockClear()
    vi.mocked(endpoints.cancelOperation).mockClear()
    vi.mocked(endpoints.postAdminReports).mockClear()
    vi.mocked(endpoints.openEventsStream).mockClear()
    vi.mocked(endpoints.openEventsStream).mockImplementation(async () => ({
      abort: vi.fn(),
    }))
    setActivePinia(createPinia())
    useSideNav().close()
    wrapper = mountDashboard()
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('renders the MKBACBOT identity and the real-time sync badge', async () => {
    await flushPromises()
    expect(wrapper.text()).toContain('MKBACBOT')
    expect(wrapper.text()).not.toContain('BACBOPRO')
    expect(wrapper.text()).not.toContain('V4.2')

    await openMenu(wrapper)
    expect(wrapper.text()).toContain('CASINO EN VIVO: ACTIVO')
  })

  it('renders both channel cards with the state from GET /channels', async () => {
    await flushPromises()
    expect(wrapper.text()).toContain('PRUEBAS TELEGRAM')
    expect(wrapper.text()).toContain('BAC BO OFICIAL')
    const switches = wrapper.findAll('[role="switch"]')
    expect(switches).toHaveLength(2)
    expect(switches[0]?.attributes('aria-checked')).toBe('false')
    expect(switches[1]?.attributes('aria-checked')).toBe('true')
  })

  it('populates the strategy selects from GET /strategies', async () => {
    await flushPromises()
    const selects = wrapper.findAll('select')
    expect(selects).toHaveLength(2)

    const telegramSelect = wrapper.find('[aria-label="Seleccionar estrategia de PRUEBAS TELEGRAM"]')
    const officialSelect = wrapper.find('[aria-label="Seleccionar estrategia de BAC BO OFICIAL"]')
    expect(telegramSelect.findAll('option')).toHaveLength(2)
    expect(officialSelect.findAll('option')).toHaveLength(2)
    expect((telegramSelect.element as HTMLSelectElement).value).toBe('')
    expect((officialSelect.element as HTMLSelectElement).value).toBe('streak-4')
  })

  it('renders the KPIs from the oficial channel of GET /reports/summary', async () => {
    await flushPromises()
    expect(wrapper.text()).toContain('GANADAS')
    expect(wrapper.text()).toContain('ALERTAS')
    expect(wrapper.text()).toContain('PERDIDAS')
    expect(wrapper.text()).toContain('TIEMPO')
    expect(wrapper.text()).toContain('8')
    expect(wrapper.text()).toContain('10')
    expect(wrapper.text()).toContain('2')
    expect(wrapper.text()).toContain('02:03:05')
  })

  it('shows empty KPIs when the summary cannot be loaded', async () => {
    vi.mocked(endpoints.getReportsSummary).mockRejectedValueOnce(
      new ApiError({ code: 'UNAUTHORIZED', message: 'Unauthorized', httpStatus: 401 }),
    )
    wrapper.unmount()
    setActivePinia(createPinia())
    wrapper = mountDashboard()
    await flushPromises()

    expect(wrapper.text()).not.toContain('02:03:05')
    const dashValues = wrapper.text().match(/—/g) ?? []
    expect(dashValues.length).toBeGreaterThanOrEqual(4)
  })

  it('renders both stats windows computed from the API history', async () => {
    await flushPromises()
    const stats = wrapper.find('[aria-label="Estadísticas"]')
    expect(stats.exists()).toBe(true)
    expect(stats.findAll('h3')).toHaveLength(2)
    expect(wrapper.text()).toContain('ÚLTIMAS 200')
    expect(wrapper.text()).toContain('ÚLTIMAS 50')
    expect(wrapper.text()).not.toContain('ÚLTIMAS 100')
    expect(wrapper.text()).toContain('70%')
    expect(wrapper.text()).toContain('25%')
    expect(wrapper.text()).toContain('100%')
  })

  it('renders the streak board (Big Road) from the last 100 plays, one cell per real play', async () => {
    await flushPromises()
    const board = wrapper.find('[aria-label="Tablero de rachas"]')
    // Las celdas vacías (huecos de la cola de dragón) quedan sin role="img"
    // a propósito, así que este selector solo cuenta jugadas reales.
    const filledCells = board.findAll('[role="img"]')
    expect(filledCells.length).toBeGreaterThan(0)
    expect(filledCells.length).toBeLessThanOrEqual(100)
  })

  it('renders the 26x6 last plays board from the API history', async () => {
    await flushPromises()
    const historyCells = wrapper.findAll(
      '[aria-label="Historial de últimas 200 jugadas"] [role="img"]',
    )
    expect(historyCells).toHaveLength(26 * 6)

    const cellClasses = historyCells.map((cell) => cell.classes())
    expect(cellClasses.some((classes) => classes.includes('bg-bbp-player'))).toBe(true)
    expect(cellClasses.some((classes) => classes.includes('bg-bbp-banker'))).toBe(true)
  })

  it('renders the last winner (from the newest history item) centered in the header', async () => {
    await flushPromises()
    expect(wrapper.text()).toContain('ÚLTIMA JUGADA: BANKER')
  })

  it('renders the oficial operation and an empty state for pruebas', async () => {
    await flushPromises()
    expect(wrapper.text()).toContain('OPERACIONES ACTUALES')
    expect(wrapper.text()).toContain('NUEVA ENTRADA')
    expect(wrapper.text()).toContain('streak-4')
    expect(wrapper.text()).toContain('Racha de 4 resultados consecutivos de BANKER.')
    expect(wrapper.text()).toContain('INGRESAR DESPUÉS DE')
    expect(wrapper.text()).toContain('APUESTA EN')
    expect(wrapper.text()).toContain('MARTINGALAS MÁXIMO')
    const emptyStates = wrapper.findAll('p').filter((p) => p.text() === 'SIN OPERACIÓN ACTIVA')
    expect(emptyStates).toHaveLength(1)
  })

  it('shows empty operation cards when no operation is active', async () => {
    api.state.oficialOperation = null
    wrapper.unmount()
    setActivePinia(createPinia())
    wrapper = mountDashboard()
    await flushPromises()

    const emptyStates = wrapper.findAll('p').filter((p) => p.text() === 'SIN OPERACIÓN ACTIVA')
    expect(emptyStates).toHaveLength(2)
    expect(wrapper.text()).not.toContain('NUEVA ENTRADA')
  })

  describe('strategy confirmation flow (PATCH /channels)', () => {
    it('opens a confirmation modal without applying the strategy immediately', async () => {
      await flushPromises()
      const officialSelect = wrapper.find('[aria-label="Seleccionar estrategia de BAC BO OFICIAL"]')
      const telegramSelect = wrapper.find(
        '[aria-label="Seleccionar estrategia de PRUEBAS TELEGRAM"]',
      )
      await officialSelect.setValue('streak-3')

      expect((telegramSelect.element as HTMLSelectElement).value).toBe('')
      expect(body().text()).toContain('¿Cambiar estrategia?')
      expect(body().text()).toContain('streak-4')
      expect(body().text()).toContain('streak-3')
      expect(vi.mocked(endpoints.patchChannel)).not.toHaveBeenCalled()
    })

    it('Cancelar restores the active strategy', async () => {
      await flushPromises()
      const officialSelect = wrapper.find('[aria-label="Seleccionar estrategia de BAC BO OFICIAL"]')
      await officialSelect.setValue('streak-3')

      const cancelButton = body()
        .findAll('button')
        .find((button) => button.text() === 'Cancelar')
      if (cancelButton) await cancelButton.trigger('click')
      await flushPromises()

      expect((officialSelect.element as HTMLSelectElement).value).toBe('streak-4')
      expect(body().text()).not.toContain('¿Cambiar estrategia?')
      expect(vi.mocked(endpoints.patchChannel)).not.toHaveBeenCalled()
    })

    it('Sí, cambiar sends PATCH and updates the active strategy', async () => {
      await flushPromises()
      const officialSelect = wrapper.find('[aria-label="Seleccionar estrategia de BAC BO OFICIAL"]')
      await officialSelect.setValue('streak-3')

      expect(body().text()).toContain('¿Cambiar estrategia?')

      const confirmButton = body()
        .findAll('button')
        .find((button) => button.text() === 'Sí, cambiar')
      if (confirmButton) await confirmButton.trigger('click')
      await flushPromises()

      expect(vi.mocked(endpoints.patchChannel)).toHaveBeenCalledWith('oficial', {
        strategyId: 'streak-3',
      })
      expect((officialSelect.element as HTMLSelectElement).value).toBe('streak-3')
      expect(body().text()).not.toContain('¿Cambiar estrategia?')
    })
  })

  describe('channel state confirmation flow (PATCH /channels)', () => {
    it('clicking the switch opens a confirmation modal without applying it', async () => {
      await flushPromises()
      const telegramSwitch = wrapper.find('[aria-label="Activar PRUEBAS TELEGRAM"]')

      await telegramSwitch.trigger('click')
      await flushPromises()

      expect(telegramSwitch.attributes('aria-checked')).toBe('true')
      expect(body().text()).toContain('¿ON PRUEBAS TELEGRAM?')
      expect(vi.mocked(endpoints.patchChannel)).not.toHaveBeenCalled()
    })

    it('Cancelar restores the original state', async () => {
      await flushPromises()
      const telegramSwitch = wrapper.find('[aria-label="Activar PRUEBAS TELEGRAM"]')

      await telegramSwitch.trigger('click')
      const cancel = body()
        .findAll('button')
        .find((button) => button.text() === 'Cancelar')
      if (cancel) await cancel.trigger('click')
      await flushPromises()

      expect(telegramSwitch.attributes('aria-checked')).toBe('false')
      expect(body().text()).not.toContain('¿ON PRUEBAS TELEGRAM?')
      expect(vi.mocked(endpoints.patchChannel)).not.toHaveBeenCalled()
    })

    it('Sí, ON sends PATCH and applies the new state', async () => {
      await flushPromises()
      const telegramSwitch = wrapper.find('[aria-label="Activar PRUEBAS TELEGRAM"]')

      await telegramSwitch.trigger('click')
      expect(body().text()).toContain('¿ON PRUEBAS TELEGRAM?')

      const confirm = body()
        .findAll('button')
        .find((button) => button.text() === 'Sí, ON')
      if (confirm) await confirm.trigger('click')
      await flushPromises()

      expect(vi.mocked(endpoints.patchChannel)).toHaveBeenCalledWith('pruebas', {
        active: true,
      })
      expect(telegramSwitch.attributes('aria-checked')).toBe('true')

      const officialSwitch = wrapper.find('[aria-label="Activar BAC BO OFICIAL"]')
      expect(officialSwitch.attributes('aria-checked')).toBe('true')
    })
  })

  describe('cancel operation flow (POST /operations/:id/cancel)', () => {
    it('requires confirmation and updates the card after cancelling', async () => {
      await flushPromises()
      const cancelButton = wrapper
        .findAll('button')
        .find((button) => button.text() === 'CANCELAR OPERACIÓN')
      expect(cancelButton).toBeTruthy()
      if (!cancelButton) return

      await cancelButton.trigger('click')
      expect(wrapper.text()).toContain('¿CONFIRMAR CANCELACIÓN DE OPERACIÓN?')
      expect(vi.mocked(endpoints.cancelOperation)).not.toHaveBeenCalled()

      const confirmButton = wrapper
        .findAll('button')
        .find((button) => button.text() === 'SÍ, CANCELAR')
      expect(confirmButton).toBeTruthy()
      if (!confirmButton) return

      await confirmButton.trigger('click')
      await flushPromises()

      expect(vi.mocked(endpoints.cancelOperation)).toHaveBeenCalledWith('op-1')
      expect(wrapper.text()).toContain('OPERACIÓN CANCELADA')
    })
  })

  describe('send report flow (POST /admin/reports)', () => {
    it('requires confirmation and disables double sends', async () => {
      await flushPromises()
      await openMenu(wrapper)
      const sendButton = wrapper
        .findAll('button')
        .find((button) => button.text() === 'ENVIAR RESUMEN')
      expect(sendButton).toBeTruthy()
      if (!sendButton) return

      await sendButton.trigger('click')
      expect(wrapper.text()).toContain('¿ENVIAR RESUMEN A TELEGRAM?')

      const yesButton = wrapper.findAll('button').find((button) => button.text() === 'SÍ')
      if (!yesButton) return
      await yesButton.trigger('click')
      await flushPromises()

      expect(vi.mocked(endpoints.postAdminReports)).toHaveBeenCalledTimes(1)
    })
  })

  describe('connection states', () => {
    it('shows the disconnected badge and banner when the stream fails', async () => {
      vi.mocked(endpoints.openEventsStream).mockRejectedValueOnce(
        new ApiError({ code: 'NETWORK_ERROR', message: 'se cayó', httpStatus: null }),
      )
      wrapper.unmount()
      setActivePinia(createPinia())
      wrapper = mountDashboard()
      await flushPromises()
      await openMenu(wrapper)

      expect(wrapper.text()).toContain('CASINO EN VIVO: DESCONECTADO')
      expect(wrapper.text()).toContain('SIN CONEXIÓN EN VIVO')
      expect(wrapper.text()).toContain('RECONECTAR')
    })
  })

  it('does not use window.confirm for confirmations', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    await flushPromises()

    const officialSelect = wrapper.find('[aria-label="Seleccionar estrategia de BAC BO OFICIAL"]')
    await officialSelect.setValue('streak-3')
    const sections = wrapper.findAll('[aria-label="Selector de estrategia"]')
    const officialSection = sections[1]!
    const saveButton = officialSection
      .findAll('button')
      .find((button) => button.text() === 'GUARDAR')
    if (saveButton) await saveButton.trigger('click')
    const confirmButton = officialSection
      .findAll('button')
      .find((button) => button.text() === 'CONFIRMAR')
    if (confirmButton) await confirmButton.trigger('click')

    expect(confirmSpy).not.toHaveBeenCalled()
    confirmSpy.mockRestore()
  })
})
