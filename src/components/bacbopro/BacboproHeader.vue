<script setup lang="ts">
import { computed, ref } from 'vue'
import { useBacboproStore } from '@/stores/bacbopro'
import { useAccessGate } from '@/composables/useAccessGate'
import StatusBadge from './StatusBadge.vue'
import BrandWordmark from './BrandWordmark.vue'
import AppIcon from '@/components/icons/AppIcon.vue'
import type { WinnerOutcome } from '@/types/bacbopro'

const store = useBacboproStore()
const { lock } = useAccessGate()

const showReportConfirm = ref(false)

const syncActive = computed(
  () => store.streamConnected && store.health?.collectorConnected !== false,
)

const syncText = computed(() =>
  syncActive.value ? 'CASINO EN VIVO: ACTIVO' : 'CASINO EN VIVO: DESCONECTADO',
)

const showConnectionBanner = computed(
  () => !store.streamConnected && (store.streamError !== null || !store.streamConnecting),
)

const winnerConfig: Record<WinnerOutcome, { label: string; color: string }> = {
  banker: { label: 'BANKER', color: 'var(--color-bbp-banker)' },
  player: { label: 'PLAYER', color: 'var(--color-bbp-player)' },
  tie: { label: 'TIE', color: 'var(--color-bbp-tie)' },
}

const lastWinner = computed(() => (store.lastWinner ? winnerConfig[store.lastWinner] : null))

function requestReport(): void {
  showReportConfirm.value = true
}

function cancelReportConfirm(): void {
  showReportConfirm.value = false
}

async function confirmReport(): Promise<void> {
  showReportConfirm.value = false
  await store.sendReport()
}
</script>

<template>
  <header class="bbp-glass bbp-elevation-1 sticky top-0 z-20 w-full border-b border-bbp-border">
    <div
      class="bbp-header-grid mx-auto w-full max-w-[1600px] items-center gap-x-2 gap-y-2 px-4 py-4 sm:gap-x-4 sm:px-6 sm:py-5 lg:px-8 2xl:max-w-[1920px] min-[2560px]:max-w-[2400px]"
      :class="{ 'bbp-header-grid--with-winner': lastWinner }"
    >
      <div class="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3" style="grid-area: left">
        <h1 class="text-2xl leading-[1.4] tracking-[-0.02em] sm:text-3xl lg:text-4xl">
          <BrandWordmark />
        </h1>
        <StatusBadge :text="syncText" :active="syncActive" />
      </div>

      <div
        v-if="lastWinner"
        class="flex min-w-0 justify-center text-center"
        style="grid-area: winner"
      >
        <p
          class="min-w-0 text-xs font-bold tracking-[0.2em]"
          :style="{ color: lastWinner.color, textShadow: '0 0 10px currentColor, 0 0 3px currentColor' }"
        >
          ÚLTIMA JUGADA: {{ lastWinner.label }}
        </p>
      </div>

      <div class="flex min-w-0 flex-wrap items-center justify-end gap-2 sm:gap-3" style="grid-area: right">
        <button
          v-if="!showReportConfirm"
          type="button"
          :disabled="store.sendingReport"
          class="rounded-md border border-bbp-tie/40 bg-bbp-tie/10 px-4 py-2 text-xs font-bold tracking-wider text-bbp-tie transition-colors duration-150 hover:bg-bbp-tie/20 focus-visible:ring-2 focus-visible:ring-bbp-focus/50 disabled:opacity-60"
          @click="requestReport"
        >
          {{ store.sendingReport ? 'ENVIANDO…' : 'ENVIAR RESUMEN' }}
        </button>
        <div
          v-else
          role="group"
          aria-label="Confirmar envío de resumen"
          class="flex min-w-0 flex-wrap items-center gap-2 rounded-md border border-bbp-border-strong bg-bbp-bg/60 px-3.5 py-1.5"
        >
          <span class="text-xs font-bold tracking-[0.1em] text-bbp-tie">
            ¿ENVIAR RESUMEN A TELEGRAM?
          </span>
          <button
            type="button"
            class="rounded border border-bbp-border bg-bbp-bg/40 px-3 py-1.5 text-xs font-bold tracking-wider text-gray-400 transition-colors duration-150 hover:bg-bbp-bg focus-visible:ring-2 focus-visible:ring-bbp-focus/50"
            @click="cancelReportConfirm"
          >
            NO
          </button>
          <button
            type="button"
            class="rounded border border-bbp-active/40 bg-bbp-active/10 px-3 py-1.5 text-xs font-bold tracking-wider text-bbp-active transition-colors duration-150 hover:bg-bbp-active/20 focus-visible:ring-2 focus-visible:ring-bbp-focus/50"
            @click="confirmReport"
          >
            SÍ
          </button>
        </div>

        <button
          type="button"
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-bbp-border text-gray-400 transition-colors duration-150 hover:border-bbp-border-strong hover:text-gray-100 focus-visible:ring-2 focus-visible:ring-bbp-focus/50"
          @click="lock"
        >
          <AppIcon name="logout" :size="16" />
        </button>
      </div>
    </div>
    <div
      v-if="showConnectionBanner"
      aria-live="polite"
      class="mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-2 border-t border-bbp-border px-3 py-2 sm:px-4 lg:px-5 2xl:max-w-[1920px] min-[2560px]:max-w-[2400px]"
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
 * "Última jugada" nunca debe ocultarse en móvil (antes usaba `hidden
 * sm:flex`, invisible por debajo de 640px). En vez de esconderla, se
 * reorganiza: en móvil pasa a una segunda fila propia, centrada; desde
 * `sm` vuelve a compartir fila con logo/estado y acciones.
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
</style>
