<script setup lang="ts">
import { computed } from 'vue'
import type { OperationEntry, OperationSide } from '@/types/bacbopro'

interface Props {
  operation: OperationEntry
  embedded?: boolean
}

const props = defineProps<Props>()

const sideConfig: Record<OperationSide, { emoji: string; letter: string; color: string }> = {
  player: { emoji: '🔵', letter: 'P', color: '#1E88E5' },
  banker: { emoji: '🔴', letter: 'B', color: '#E53935' },
}

const entryAfter = computed(() => sideConfig[props.operation.entryAfterSide])
const betOn = computed(() => sideConfig[props.operation.betOnSide])
</script>

<template>
  <section
    aria-label="Operación actual"
    :class="embedded ? 'p-4' : 'rounded-lg border border-bbp-border bg-bbp-panel p-4'"
  >
    <h2 class="text-center text-lg font-bold tracking-[0.15em] text-gray-300">
      OPERACIÓN ACTUAL
    </h2>

    <p
      class="mt-3 rounded-md border border-bbp-tie/40 bg-bbp-tie/10 px-3 py-2 text-center text-base font-bold tracking-wider text-bbp-tie"
    >
      🚨 {{ operation.alertLabel }} 🚨
    </p>

    <div class="mt-3 flex flex-col gap-2">
      <div
        class="flex items-center justify-between gap-2 rounded-md border border-bbp-border bg-bbp-bg/60 px-3 py-2"
      >
        <span class="text-xs tracking-wider text-gray-400">🎯 JUEGO:</span>
        <span class="text-sm font-semibold text-gray-100">{{ operation.game }}</span>
      </div>

      <div
        class="flex items-center justify-between gap-2 rounded-md border border-bbp-border bg-bbp-bg/60 px-3 py-2"
      >
        <span class="text-xs tracking-wider text-gray-400">📊 PATRON:</span>
        <span class="font-mono text-sm font-semibold text-gray-100">{{ operation.pattern }}</span>
      </div>

      <div
        class="flex items-center justify-between gap-2 rounded-md border border-bbp-border bg-bbp-bg/60 px-3 py-2"
      >
        <span class="text-xs tracking-wider text-gray-400">💣 INGRESAR DESPUES DE:</span>
        <span class="text-sm font-bold" :style="{ color: entryAfter.color }">
          {{ entryAfter.emoji }} {{ entryAfter.letter }}
        </span>
      </div>

      <div
        class="flex items-center justify-between gap-2 rounded-md border border-bbp-border bg-bbp-bg/60 px-3 py-2"
      >
        <span class="text-xs tracking-wider text-gray-400">🔥 APUESTA EN:</span>
        <span class="text-sm font-bold" :style="{ color: betOn.color }">
          {{ betOn.emoji }} {{ betOn.letter }}
        </span>
      </div>

      <div
        class="flex items-center justify-between gap-2 rounded-md border border-bbp-border bg-bbp-bg/60 px-3 py-2"
      >
        <span class="text-xs tracking-wider text-gray-400">🔁 MARTINGALAS MAXIMO:</span>
        <span class="font-mono text-xl font-bold text-gray-100">
          {{ operation.maxMartingales }}
        </span>
      </div>
    </div>
  </section>
</template>
