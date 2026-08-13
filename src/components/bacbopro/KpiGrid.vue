<script setup lang="ts">
import type { KpiItem } from '@/types/bacbopro'
import KpiCard from './KpiCard.vue'

interface Props {
  items: KpiItem[]
}

defineProps<Props>()
</script>

<template>
  <section aria-label="Indicadores clave" class="grid grid-cols-2 gap-3 sm:grid-cols-4">
    <KpiCard v-for="item in items" :key="item.label" :item="item" />
  </section>
</template>
