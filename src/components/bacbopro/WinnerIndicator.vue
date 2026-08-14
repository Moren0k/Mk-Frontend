<script setup lang="ts">
import { computed } from 'vue'
import type { WinnerOutcome } from '@/types/bacbopro'

interface Props {
  winner: WinnerOutcome
}

const props = defineProps<Props>()

const winnerConfig: Record<WinnerOutcome, { label: string; color: string }> = {
  banker: { label: 'BANKER', color: 'var(--color-bbp-banker)' },
  player: { label: 'PLAYER', color: 'var(--color-bbp-player)' },
  tie: { label: 'EMPATE', color: 'var(--color-bbp-tie)' },
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
      :style="{
        backgroundColor: current.color,
        boxShadow: `0 0 22px color-mix(in srgb, ${current.color} 45%, transparent)`,
      }"
    />
    <span class="text-xl font-bold tracking-[0.2em]" :style="{ color: current.color }">
      {{ current.label }}
    </span>
  </div>
</template>
