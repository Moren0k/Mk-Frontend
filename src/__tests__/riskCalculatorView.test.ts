import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import RiskCalculatorView from '@/views/RiskCalculatorView.vue'
import { useBacboproStore } from '@/stores/bacbopro'
import { useSideNav } from '@/composables/useSideNav'

vi.mock('@/api/endpoints', () => ({
  getChannel: vi.fn(() =>
    Promise.resolve({
      data: {
        channel: 'oficial',
        strategyId: 'streak-4',
        active: true,
        maxMartingalesOverride: null,
      },
      requestId: 'r1',
    }),
  ),
  getOperations: vi.fn(() => Promise.resolve({ data: [], requestId: 'r2' })),
  getHistory: vi.fn(() =>
    Promise.resolve({ data: [], meta: { limit: 200, count: 0 }, requestId: 'r3' }),
  ),
  getReportsSummary: vi.fn(() =>
    Promise.resolve({
      data: { uptimeMs: 0, oficial: { won: 87, lost: 10, alertsSent: 5 } },
      requestId: 'r4',
    }),
  ),
  getStrategies: vi.fn(() => Promise.resolve({ data: [], requestId: 'r5' })),
  getHealth: vi.fn(() =>
    Promise.resolve({
      data: {
        ok: true,
        collectorConnected: true,
        lastGameReceivedAt: null,
        gamesInMemory: 0,
        activeOperations: 0,
        registeredStrategies: 0,
        registeredChannels: 0,
        lastError: null,
        db: { ok: true },
      },
      requestId: 'r6',
    }),
  ),
  patchChannel: vi.fn(),
  cancelOperation: vi.fn(),
  postAdminReports: vi.fn(),
  openEventsStream: vi.fn(() => Promise.resolve({ abort: vi.fn() })),
}))

// El store ya no se inicializa desde la propia vista (eso ahora vive en
// App.vue, para sobrevivir a la navegación entre páginas) — el test lo
// dispara a mano, igual que haría el watcher de App.vue al desbloquear.
function mountView(): VueWrapper {
  void useBacboproStore().initialize()
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/herramientas', component: RiskCalculatorView },
    ],
  })
  return mount(RiskCalculatorView, { global: { plugins: [router] } })
}

describe('RiskCalculatorView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    useSideNav().close()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza el header, el menú lateral y la calculadora unificada', async () => {
    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.text()).toContain('MKBACBOT')
    expect(wrapper.text()).toContain('CALCULADORA DE RIESGO')

    await wrapper.get('[aria-label="Abrir menú"]').trigger('click')
    expect(wrapper.text()).toContain('Calculadora de riesgo')
  })

  it('el contexto del sistema muestra las estadísticas reales que llegan por la API', async () => {
    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.text()).toContain('89,69%')
    expect(wrapper.text()).toContain('97')
  })
})
