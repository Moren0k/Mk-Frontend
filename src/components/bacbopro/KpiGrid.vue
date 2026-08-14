<script setup lang="ts">
import type { KpiItem } from '@/types/bacbopro'
import KpiCard from './KpiCard.vue'

interface Props {
  items: KpiItem[]
}

defineProps<Props>()
</script>

<template>
  <section
    aria-label="Indicadores clave"
    class="grid w-full min-w-0 grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4"
  >
    <KpiCard v-for="item in items" :key="item.label" :item="item" />
  </section>
</template>
