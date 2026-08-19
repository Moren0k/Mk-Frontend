import { ref } from 'vue'

/**
 * Estado compartido a nivel de módulo: el botón que abre el menú vive en el
 * header y el menú en sí es un componente aparte, así que ambos necesitan la
 * misma fuente de verdad (y además debe sobrevivir a los remontajes al
 * cambiar de página). Cerrado por defecto: no deja nada visible en pantalla.
 */
const isOpen = ref(false)

export function useSideNav() {
  function toggle(): void {
    isOpen.value = !isOpen.value
  }

  function close(): void {
    isOpen.value = false
  }

  return { isOpen, toggle, close }
}
