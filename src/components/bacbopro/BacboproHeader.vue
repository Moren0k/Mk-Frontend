<script setup lang="ts">
import { computed } from 'vue'
import { useBacboproStore } from '@/stores/bacbopro'
import { useSideNav } from '@/composables/useSideNav'
import BrandWordmark from './BrandWordmark.vue'
import AppIcon from '@/components/icons/AppIcon.vue'
import type { WinnerOutcome } from '@/types/bacbopro'

const store = useBacboproStore()
const { toggle } = useSideNav()

const showConnectionBanner = computed(
  () => !store.streamConnected && (store.streamError !== null || !store.streamConnecting),
)

const winnerConfig: Record<WinnerOutcome, { label: string; color: string; ballClass: string }> = {
  banker: {
    label: 'BANKER',
    color: 'var(--color-bbp-banker)',
    ballClass:
      'bg-bbp-banker shadow-[0_0_10px_color-mix(in_srgb,var(--color-bbp-banker)_50%,transparent)]',
  },
  player: {
    label: 'PLAYER',
    color: 'var(--color-bbp-player)',
    ballClass:
      'bg-bbp-player shadow-[0_0_10px_color-mix(in_srgb,var(--color-bbp-player)_50%,transparent)]',
  },
  tie: {
    label: 'TIE',
    color: 'var(--color-bbp-tie)',
    ballClass:
      'bg-bbp-tie shadow-[0_0_10px_color-mix(in_srgb,var(--color-bbp-tie)_50%,transparent)]',
  },
}

const lastWinner = computed(() => (store.lastWinner ? winnerConfig[store.lastWinner] : null))
</script>

<template>
  <header class="bbp-glass bbp-elevation-1 sticky top-0 z-20 w-full border-b border-bbp-border">
    <div
      class="bbp-header-grid mx-auto w-full max-w-[1600px] items-center gap-x-2 gap-y-1.5 px-4 py-2 sm:gap-x-4 sm:px-6 sm:py-2.5 lg:px-8 2xl:max-w-[1920px] min-[2560px]:max-w-[2400px]"
      :class="{ 'bbp-header-grid--with-winner': lastWinner }"
    >
      <div class="flex min-w-0 items-center" style="grid-area: left">
        <button
          type="button"
          title="Abrir menú"
          aria-label="Abrir menú"
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-bbp-border text-gray-400 transition-colors duration-150 hover:border-bbp-border-strong hover:text-gray-100 focus-visible:ring-2 focus-visible:ring-bbp-focus/50"
          @click="toggle"
        >
          <AppIcon name="menu" :size="16" />
        </button>
      </div>

      <div
        v-if="lastWinner"
        class="flex min-w-0 justify-center text-center"
        style="grid-area: winner"
      >
        <div
          class="flex items-center gap-2 rounded-lg border border-bbp-border bg-bbp-panel/40 px-3 py-1"
        >
          <span
            :key="store.lastWinner ?? ''"
            aria-hidden="true"
            class="bbp-header-winner-pulse"
            :style="{ color: lastWinner.color }"
          >
            <span
              class="block h-4 w-4 shrink-0 rounded-full sm:h-5 sm:w-5"
              :class="lastWinner.ballClass"
            />
          </span>
          <p
            class="min-w-0 text-xs font-bold tracking-[0.15em] sm:text-sm"
            :style="{
              color: lastWinner.color,
              textShadow: '0 0 10px currentColor, 0 0 3px currentColor',
            }"
          >
            ÚLTIMA JUGADA: {{ lastWinner.label }}
          </p>
        </div>
      </div>

      <div class="flex min-w-0 items-center justify-end" style="grid-area: right">
        <h1 class="text-lg leading-[1.4] tracking-[-0.02em] sm:text-xl lg:text-2xl">
          <BrandWordmark />
        </h1>
      </div>
    </div>
    <div
      v-if="showConnectionBanner"
      aria-live="polite"
      class="mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-2 border-t border-bbp-border px-3 py-1.5 sm:px-4 lg:px-5 2xl:max-w-[1920px] min-[2560px]:max-w-[2400px]"
    >
      <span class="min-w-0 text-xs font-semibold tracking-wider text-bbp-banker">
        SIN CONEXIÓN EN VIVO{{ store.streamError ? ` — ${store.streamError}` : '' }}
      </span>
      <button
        type="button"
        :disabled="store.streamConnecting"
        class="rounded border border-bbp-active/40 bg-bbp-active/10 px-3 py-1.5 text-xs font-bold tracking-wider text-bbp-active transition-colors duration-150 hover:bg-bbp-active/20 focus-visible:ring-2 focus-visible:ring-bbp-focus/50 disabled:opacity-60"
        @click="store.connectStream()"
      >
        RECONECTAR
      </button>
    </div>
  </header>
</template>

<style scoped>
/*
 * "Última jugada" nunca debe ocultarse en móvil: en vez de esconderla, se
 * reorganiza en una segunda fila propia, centrada; desde `sm` vuelve a
 * compartir fila con el botón de menú (izq.) y el logo (der.).
 */
.bbp-header-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-areas: 'left right';
}

.bbp-header-grid--with-winner {
  grid-template-areas:
    'left right'
    'winner winner';
}

@media (min-width: 640px) {
  .bbp-header-grid,
  .bbp-header-grid--with-winner {
    grid-template-columns: auto minmax(0, 1fr) auto;
    grid-template-areas: 'left winner right';
  }
}

/*
 * Glow pulsante de la bola de "Última jugada": late dos veces al remontarse
 * el wrapper (key = lastWinner). Anima solo el box-shadow del wrapper con
 * currentColor, sin tocar el shadow estático definido en `ballClass`.
 */
.bbp-header-winner-pulse {
  display: inline-block;
  border-radius: 9999px;
  animation: bbp-winner-glow 1.1s ease-in-out 2;
}

@keyframes bbp-winner-glow {
  0%,
  100% {
    box-shadow: 0 0 0 0 transparent;
  }
  50% {
    box-shadow: 0 0 18px 5px color-mix(in srgb, currentColor 55%, transparent);
  }
}
</style>
