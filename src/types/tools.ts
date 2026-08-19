import type { IconName } from '@/components/icons/AppIcon.vue'

export interface ToolDefinition {
  id: string
  label: string
  icon: IconName
  /** Ruta dedicada de la herramienta (segundo nivel de navegación). */
  to: string
}
