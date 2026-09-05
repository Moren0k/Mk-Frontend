<script setup lang="ts">
import type { KpiItem } from '@/types/bacbopro'
import KpiCard from './KpiCard.vue'

interface Props {
  items: KpiItem[]
}

defineProps<Props>()
</script>

<template>
  <!--
    5 columnas recién en `xl`, no en `lg`: BacboproDashboard.vue divide su
    grid en 2 columnas (1.6fr/1fr) justo a partir de `lg`, así que esta
    grilla se queda con menos ancho real en ese punto que en `md` (donde
    todavía ocupa el ancho completo). Saltar directo a 5 columnas en `lg`
    comprimía demasiado cada tarjeta y el texto se desbordaba.

    Padding y gap se mantienen CONSTANTES desde `sm` en adelante (ver
    KpiCard.vue) a propósito: aumentarlos junto con el salto de 4 a 5
    columnas en `xl` reduce el ancho de contenido en vez de aumentarlo
    (verificado con cálculo: a 1280px de viewport, 5 columnas + más padding
    dejaban ~85px de contenido por tarjeta, peor que los ~103px de 4
    columnas en 1024px). Con padding/gap fijos, el ancho de contenido nunca
    baja de ese piso en ningún ancho de pantalla soportado.
  -->
  <section
    aria-label="Indicadores clave"
    class="grid w-full min-w-0 grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5"
  >
    <KpiCard v-for="item in items" :key="item.label" :item="item" />
  </section>
</template>
