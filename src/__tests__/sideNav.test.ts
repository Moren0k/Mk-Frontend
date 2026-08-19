import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import SideNav from '@/components/tools/SideNav.vue'
import { useSideNav } from '@/composables/useSideNav'

vi.mock('@/api/endpoints', () => ({
  postAdminReports: vi.fn(() =>
    Promise.resolve({
      data: { channel: 'todos', dispatchedAt: '2026-08-19T00:00:00.000Z', metrics: {} },
      requestId: 'r1',
    }),
  ),
}))

async function mountAt(initialPath: string) {
  setActivePinia(createPinia())
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/herramientas', component: { template: '<div />' } },
    ],
  })
  await router.push(initialPath)
  return { router, wrapper: mount(SideNav, { global: { plugins: [router] } }) }
}

describe('SideNav', () => {
  beforeEach(() => {
    // El abierto/cerrado es estado compartido a nivel de módulo (para
    // sobrevivir a la navegación entre páginas) — se resetea entre tests.
    useSideNav().close()
  })

  it('no muestra nada (ni el drawer ni el fondo) mientras está cerrado', async () => {
    const { wrapper } = await mountAt('/')
    expect(wrapper.find('nav').exists()).toBe(false)
    expect(wrapper.text()).toBe('')
  })

  it('al abrirse, muestra el link a Panel y a Calculadora de riesgo', async () => {
    const { wrapper } = await mountAt('/')
    useSideNav().toggle()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Panel')
    expect(wrapper.text()).toContain('Calculadora de riesgo')

    const links = wrapper.findAll('a')
    expect(links.map((link) => link.attributes('href'))).toEqual(['/', '/herramientas'])
  })

  it('resalta "Panel" como activo cuando la ruta actual es "/"', async () => {
    const { wrapper } = await mountAt('/')
    useSideNav().toggle()
    await wrapper.vm.$nextTick()

    const links = wrapper.findAll('a')
    expect(links[0]?.classes()).toContain('text-bbp-active')
    expect(links[1]?.classes()).not.toContain('text-bbp-active')
  })

  it('resalta "Calculadora de riesgo" como activo cuando la ruta es "/herramientas"', async () => {
    const { wrapper } = await mountAt('/herramientas')
    useSideNav().toggle()
    await wrapper.vm.$nextTick()

    const links = wrapper.findAll('a')
    expect(links[0]?.classes()).not.toContain('text-bbp-active')
    expect(links[1]?.classes()).toContain('text-bbp-active')
  })

  it('el botón de cerrar y el fondo cierran el menú (no queda nada visible)', async () => {
    const { wrapper } = await mountAt('/')
    useSideNav().toggle()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('nav').exists()).toBe(true)

    await wrapper.get('[aria-label="Cerrar menú"]').trigger('click')
    expect(wrapper.find('nav').exists()).toBe(false)
    expect(wrapper.text()).toBe('')
  })

  it('hacer clic en un link de navegación también cierra el menú', async () => {
    const { wrapper } = await mountAt('/')
    useSideNav().toggle()
    await wrapper.vm.$nextTick()

    await wrapper.get('a').trigger('click')
    expect(useSideNav().isOpen.value).toBe(false)
  })

  it('el estado abierto/cerrado persiste entre remontajes (simula navegar de página)', async () => {
    const first = await mountAt('/')
    useSideNav().toggle()
    await first.wrapper.vm.$nextTick()
    first.wrapper.unmount()

    const second = await mountAt('/herramientas')
    expect(second.wrapper.find('nav').exists()).toBe(true)
  })

  it('incluye el botón "Enviar resumen" con su confirmación', async () => {
    const { wrapper } = await mountAt('/')
    useSideNav().toggle()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('ENVIAR RESUMEN')
    const reportButton = wrapper.findAll('button').find((b) => b.text().includes('ENVIAR RESUMEN'))
    expect(reportButton).toBeTruthy()
    await reportButton!.trigger('click')
    expect(wrapper.text()).toContain('¿ENVIAR RESUMEN A TELEGRAM?')
  })

  it('incluye el botón de cerrar sesión', async () => {
    const { wrapper } = await mountAt('/')
    useSideNav().toggle()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[aria-label="Cerrar sesión"]').exists()).toBe(true)
  })
})
