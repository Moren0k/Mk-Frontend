<script setup lang="ts">
import type { StreakColumn } from '@/types/bacbopro'
import StreakCell from './StreakCell.vue'

interface Props {
  column: StreakColumn
}

defineProps<Props>()
</script>

<template>
  <div class="streak-column flex flex-col gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-2">
    <StreakCell v-for="index in column.count" :key="index" :state="column.outcome" />
  </div>
</template>
