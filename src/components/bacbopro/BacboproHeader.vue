<script setup lang="ts">
import { computed, ref } from 'vue'
import { useBacboproStore } from '@/stores/bacbopro'
import StatusBadge from './StatusBadge.vue'
import logoUrl from '@/assets/images/MKBACBO_LOGO.png'

const store = useBacboproStore()

const showReportConfirm = ref(false)

const syncActive = computed(
  () => store.streamConnected && store.health?.collectorConnected !== false,
)

const syncText = computed(() =>
  syncActive.value ? 'CASINO SYNC: ACTIVO' : 'CASINO SYNC: DESCONECTADO',
)

const showConnectionBanner = computed(
  () => !store.streamConnected && (store.streamError !== null || !store.streamConnecting),
)

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
  <header class="sticky top-0 z-20 border-b border-bbp-border bg-bbp-bg">
    <div
      class="mx-auto flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3.5 max-[400px]:gap-x-3 sm:py-4"
    >
      <div class="flex min-w-0 items-center gap-3">
        <span
          class="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-bbp-border-strong sm:h-10 sm:w-10"
        >
          <img :src="logoUrl" alt="MKBACBO" class="h-full w-full object-contain p-0.5" />
        </span>
        <h1
          class="text-xl font-black tracking-[0.3em] text-gray-100 max-[400px]:text-lg max-[400px]:tracking-[0.2em] sm:text-2xl sm:tracking-[0.35em] lg:text-3xl"
        >
          MKBACBO
        </h1>
      </div>
      <div class="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
        <StatusBadge :text="syncText" variant="sync" :active="syncActive" />
        <StatusBadge text="MKBOT. VIP" variant="vip" />
        <div
          v-if="store.sendReportError"
          aria-live="polite"
          class="flex min-w-0 flex-wrap items-center gap-2 rounded-md border border-bbp-banker/40 bg-bbp-banker/10 px-2.5 py-1"
        >
          <span class="text-[0.625rem] font-semibold tracking-wider text-bbp-banker">
            {{ store.sendReportError }}
          </span>
          <button
            type="button"
            aria-label="Cerrar error de envío de resumen"
            class="rounded border border-bbp-border bg-bbp-bg/40 px-2 py-0.5 text-[0.625rem] font-bold tracking-wider text-gray-400 transition-colors duration-200 hover:bg-bbp-bg"
            @click="store.clearSendReportError()"
          >
            CERRAR
          </button>
        </div>
        <button
          v-if="!showReportConfirm"
          type="button"
          :disabled="store.sendingReport"
          class="rounded-md border border-bbp-tie/40 bg-bbp-tie/10 px-2.5 py-1 text-[0.6875rem] font-bold tracking-wider text-bbp-tie transition-colors duration-200 hover:bg-bbp-tie/20 disabled:opacity-60"
          @click="requestReport"
        >
          {{ store.sendingReport ? 'ENVIANDO…' : 'ENVIAR RESUMEN' }}
        </button>
        <div
          v-else
          role="group"
          aria-label="Confirmar envío de resumen"
          class="flex min-w-0 flex-wrap items-center gap-2 rounded-md border border-bbp-border-strong bg-bbp-bg/60 px-2.5 py-1.5"
        >
          <span class="text-[0.6875rem] font-bold tracking-[0.15em] text-bbp-tie">
            ¿ENVIAR RESUMEN A TELEGRAM?
          </span>
          <button
            type="button"
            class="rounded border border-bbp-border bg-bbp-bg/40 px-2 py-0.5 text-[0.625rem] font-bold tracking-wider text-gray-400 transition-colors duration-200 hover:bg-bbp-bg"
            @click="cancelReportConfirm"
          >
            NO
          </button>
          <button
            type="button"
            class="rounded border border-bbp-active/40 bg-bbp-active/10 px-2 py-0.5 text-[0.625rem] font-bold tracking-wider text-bbp-active transition-colors duration-200 hover:bg-bbp-active/20"
            @click="confirmReport"
          >
            SÍ
          </button>
        </div>
      </div>
    </div>
    <div
      v-if="showConnectionBanner"
      aria-live="polite"
      class="mx-auto flex w-full flex-wrap items-center justify-between gap-2 border-t border-bbp-border bg-bbp-bg px-3 py-2"
    >
      <span class="min-w-0 text-[0.6875rem] font-semibold tracking-wider text-bbp-banker">
        SIN CONEXIÓN EN VIVO{{ store.streamError ? ` — ${store.streamError}` : '' }}
      </span>
      <button
        type="button"
        :disabled="store.streamConnecting"
        class="rounded border border-bbp-active/40 bg-bbp-active/10 px-2.5 py-1 text-[0.6875rem] font-bold tracking-wider text-bbp-active transition-colors duration-200 hover:bg-bbp-active/20 disabled:opacity-60"
        @click="store.connectStream()"
      >
        RECONECTAR
      </button>
    </div>
  </header>
</template>
