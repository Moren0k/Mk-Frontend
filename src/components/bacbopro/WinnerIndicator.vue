<script setup lang="ts">
import { computed } from 'vue'
import type { WinnerOutcome } from '@/types/bacbopro'

interface Props {
  winner: WinnerOutcome
}

const props = defineProps<Props>()

const winnerConfig: Record<WinnerOutcome, { label: string; color: string }> = {
  banker: { label: 'BANKER', color: '#E53935' },
  player: { label: 'PLAYER', color: '#1E88E5' },
  tie: { label: 'EMPATE', color: '#FBC02D' },
}

const current = computed(() => winnerConfig[props.winner])
</script>

<template>
  <div
    class="flex flex-col items-center gap-3"
    role="img"
    :aria-label="`Último ganador: ${current.label}`"
  >
    <span
      class="inline-block h-20 w-20 rounded-full sm:h-24 sm:w-24"
      :style="{ backgroundColor: current.color, boxShadow: `0 0 1.125rem ${current.color}59` }"
    />
    <span class="text-xl font-bold tracking-[0.2em]" :style="{ color: current.color }">
      {{ current.label }}
    </span>
  </div>
</template>
