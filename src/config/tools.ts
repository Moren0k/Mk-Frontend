import type { ToolDefinition } from '@/types/tools'

/**
 * Registro de herramientas disponibles como páginas dedicadas. Para agregar
 * una nueva: sumar su entrada aquí, su ruta en `router/index.ts` y su vista
 * en `views/` — el menú lateral (`SideNav.vue`) la recoge sola.
 */
export const TOOLS: ToolDefinition[] = [
  {
    id: 'calculadora-riesgo',
    label: 'Calculadora de riesgo',
    icon: 'calculator',
    to: '/herramientas',
  },
]
