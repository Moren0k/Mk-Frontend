<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from '@/components/icons/AppIcon.vue'
import type { IconName } from '@/components/icons/AppIcon.vue'
import {
  GALE_MULTIPLIERS,
  MIN_BET,
  calculateBankrollStrategy,
  minBalanceRequiredFor,
} from '@/utils/bankrollCalculator'
import { formatCurrencyCOP, formatDigitsWithThousands, parseCurrencyAmount } from '@/utils/currency'
import {
  DEFAULT_RISK_PROFILE_ID,
  RISK_PROFILES,
  calculateSessionLimits,
  evaluateCurrentBalance,
  getRiskProfile,
  type RiskProfileId,
  type SessionStatus,
} from '@/utils/stopLossTakeProfit'
import { summaryToEffectivenessStats } from '@/mappers/bacboproMapper'
import { useBacboproStore } from '@/stores/bacbopro'

const store = useBacboproStore()

const rawBalanceInput = ref('')
const rawCurrentInput = ref('')
const selectedProfileId = ref<RiskProfileId>(DEFAULT_RISK_PROFILE_ID)

const hasBalanceInput = computed(() => rawBalanceInput.value.trim() !== '')
const hasCurrentInput = computed(() => rawCurrentInput.value.trim() !== '')

const initialBalance = computed(() => parseCurrencyAmount(rawBalanceInput.value))
const currentBalanceValue = computed(() => parseCurrencyAmount(rawCurrentInput.value))

const selectedProfile = computed(() => getRiskProfile(selectedProfileId.value))

const bankrollResult = computed(() =>
  calculateBankrollStrategy(initialBalance.value, selectedProfile.value.cyclesToSurvive),
)
const sessionLimits = computed(() =>
  calculateSessionLimits(initialBalance.value, selectedProfileId.value),
)

const statusResult = computed(() => {
  if (!sessionLimits.value || !hasCurrentInput.value) return null
  return evaluateCurrentBalance(currentBalanceValue.value, sessionLimits.value)
})

const galeProgressionLabel = `1‑${GALE_MULTIPLIERS.gale1}‑${GALE_MULTIPLIERS.gale2}`

const contextStats = computed(() =>
  store.summary ? summaryToEffectivenessStats(store.summary) : null,
)
const effectivenessLabel = computed(() =>
  contextStats.value ? contextStats.value.effectivenessPct.toFixed(2).replace('.', ',') : null,
)

// Puntuación de miles en vivo: en cada tecla se reformatea el valor
// completo, así el campo siempre muestra "500.000" mientras se escribe.
function handleBalanceInput(event: Event): void {
  rawBalanceInput.value = formatDigitsWithThousands((event.target as HTMLInputElement).value)
}

function handleCurrentInput(event: Event): void {
  rawCurrentInput.value = formatDigitsWithThousands((event.target as HTMLInputElement).value)
}

function selectProfile(id: RiskProfileId): void {
  selectedProfileId.value = id
}

interface StatusConfig {
  icon: IconName
  title: string
  message: string
  border: string
  bg: string
  text: string
}

const STATUS_CONFIG: Record<SessionStatus, StatusConfig> = {
  'below-stop-loss': {
    icon: 'error',
    title: 'LÍMITE DE PÉRDIDA ALCANZADO',
    message:
      'Tu saldo actual ha llegado o superado el límite de pérdida definido para esta sesión. Debes detener la operación.',
    border: 'border-bbp-banker/40',
    bg: 'bg-bbp-banker/10',
    text: 'text-bbp-banker',
  },
  'safe-zone': {
    icon: 'check',
    title: 'SIGUES DENTRO DE TU PLAN',
    message: '',
    border: 'border-bbp-active/40',
    bg: 'bg-bbp-active/10',
    text: 'text-bbp-active',
  },
  'take-profit-reached': {
    icon: 'success',
    title: 'OBJETIVO DE GANANCIA ALCANZADO',
    message:
      'Has alcanzado el objetivo definido para esta sesión. Considera detenerte y cerrar la sesión.',
    border: 'border-bbp-active/40',
    bg: 'bg-bbp-active/10',
    text: 'text-bbp-active',
  },
  'above-take-profit': {
    icon: 'warning',
    title: 'OBJETIVO SUPERADO',
    message:
      'El objetivo de la sesión ya fue alcanzado. Evita aumentar innecesariamente la exposición por intentar seguir acumulando ganancias.',
    border: 'border-bbp-warning/40',
    bg: 'bg-bbp-warning/10',
    text: 'text-bbp-warning',
  },
}
</script>

<template>
  <section
    aria-labelledby="risk-calc-title"
    class="min-w-0 bbp-elevation-1 rounded-lg border border-bbp-border bg-bbp-panel p-5 sm:p-6"
  >
    <h2 id="risk-calc-title" class="text-center text-lg font-bold tracking-[0.15em] text-gray-100">
      CALCULADORA DE RIESGO
    </h2>
    <p class="mt-1 text-center text-xs font-medium text-gray-400">
      Apuesta base, Stop Loss y Take Profit según un mismo perfil de riesgo
    </p>

    <div class="mx-auto mt-5 max-w-sm">
      <label
        for="risk-initial-balance"
        class="block text-xs font-bold tracking-[0.15em] text-gray-400"
      >
        SALDO DISPONIBLE
      </label>
      <div class="relative mt-1.5">
        <span
          class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-semibold text-gray-500"
          aria-hidden="true"
        >
          $
        </span>
        <input
          id="risk-initial-balance"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          placeholder="Ej: 105.000"
          class="w-full rounded-md border border-bbp-border-strong bg-bbp-bg/80 py-2.5 pr-3 pl-7 text-sm font-semibold text-gray-100 outline-none transition-colors duration-150 focus-visible:border-bbp-focus focus-visible:ring-2 focus-visible:ring-bbp-focus/40"
          :value="rawBalanceInput"
          @input="handleBalanceInput"
        />
      </div>
      <p v-if="hasBalanceInput" class="mt-1.5 text-xs text-gray-500">
        Saldo detectado:
        <span class="font-semibold text-gray-300">{{ formatCurrencyCOP(initialBalance) }}</span>
      </p>
      <p v-else class="mt-1.5 text-xs text-gray-500">
        La apuesta mínima del casino es {{ formatCurrencyCOP(MIN_BET) }}; con el perfil recomendado
        necesitas al menos {{ formatCurrencyCOP(minBalanceRequiredFor(3)) }} para recibir una
        apuesta base.
      </p>
    </div>

    <div class="mx-auto mt-5 max-w-sm">
      <p class="text-center text-xs font-bold tracking-[0.15em] text-gray-400">PERFIL DE RIESGO</p>
      <div class="mt-2 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Perfil de riesgo">
        <button
          v-for="profile in RISK_PROFILES"
          :key="profile.id"
          type="button"
          role="radio"
          :aria-checked="selectedProfileId === profile.id"
          class="rounded-md border px-2 py-2 text-center transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-bbp-focus/50"
          :class="
            selectedProfileId === profile.id
              ? 'border-bbp-active/40 bg-bbp-active/10 text-bbp-active'
              : 'border-bbp-border text-gray-400 hover:border-bbp-border-strong hover:text-gray-100'
          "
          @click="selectProfile(profile.id)"
        >
          <span class="block text-[0.6875rem] font-bold tracking-wider">
            {{ profile.label.toUpperCase() }}
          </span>
          <span class="mt-0.5 block text-[0.625rem] font-medium opacity-80">
            SL {{ profile.stopLossPct }}% · TP {{ profile.takeProfitPct }}%
          </span>
          <span class="mt-0.5 block text-[0.625rem] font-medium opacity-80">
            Soporta {{ profile.cyclesToSurvive }} ciclos
          </span>
        </button>
      </div>
    </div>

    <p v-if="!hasBalanceInput" class="mx-auto mt-6 max-w-sm text-center text-sm text-gray-400">
      Ingresa el saldo con el que inicias la sesión para calcular tu apuesta base, tu Stop Loss y tu
      Take Profit.
    </p>

    <template v-else-if="!sessionLimits">
      <p class="mx-auto mt-6 max-w-sm text-center text-sm text-gray-400">
        Ingresa un saldo válido mayor a $0 para calcular tus resultados.
      </p>
    </template>

    <template v-else>
      <!-- Apuesta base -->
      <div v-if="bankrollResult.sufficient" class="mx-auto mt-6 max-w-sm text-center">
        <p class="text-xs font-bold tracking-[0.15em] text-gray-400">
          TU APUESTA BASE MÁXIMA RECOMENDADA
        </p>
        <p
          class="mt-2 text-4xl font-bold text-bbp-active sm:text-5xl [text-shadow:0_0_14px_currentColor]"
        >
          {{ formatCurrencyCOP(bankrollResult.baseBet) }}
        </p>
        <p class="mx-auto mt-3 max-w-xs text-xs text-gray-400">
          Con tu saldo y perfil actuales, esta es la apuesta base máxima recomendada para poder
          soportar hasta {{ bankrollResult.cyclesToSurvive }} ciclos perdidos consecutivos con la
          estrategia {{ galeProgressionLabel }}.
        </p>

        <div class="mt-5">
          <p class="text-center text-xs font-bold tracking-[0.15em] text-gray-400">TU PROGRESIÓN</p>
          <div class="mt-2 grid grid-cols-3 gap-2">
            <div class="rounded-md border border-bbp-border bg-bbp-bg/60 p-3 text-center">
              <p class="text-[0.625rem] font-bold tracking-wider text-gray-500">APUESTA BASE</p>
              <p class="mt-1 font-mono text-sm font-bold text-gray-100">
                {{ formatCurrencyCOP(bankrollResult.baseBet) }}
              </p>
            </div>
            <div class="rounded-md border border-bbp-border bg-bbp-bg/60 p-3 text-center">
              <p class="text-[0.625rem] font-bold tracking-wider text-gray-500">GALE 1</p>
              <p class="mt-1 font-mono text-sm font-bold text-bbp-mg1">
                {{ formatCurrencyCOP(bankrollResult.gale1) }}
              </p>
            </div>
            <div class="rounded-md border border-bbp-border bg-bbp-bg/60 p-3 text-center">
              <p class="text-[0.625rem] font-bold tracking-wider text-gray-500">GALE 2</p>
              <p class="mt-1 font-mono text-sm font-bold text-bbp-mg2">
                {{ formatCurrencyCOP(bankrollResult.gale2) }}
              </p>
            </div>
          </div>
        </div>

        <div class="mt-5">
          <p class="text-center text-xs font-bold tracking-[0.15em] text-gray-400">
            RESUMEN DE RIESGO
          </p>
          <dl class="mt-2 space-y-1.5 rounded-md border border-bbp-border bg-bbp-bg/60 p-3 text-xs">
            <div class="flex items-center justify-between gap-2">
              <dt class="text-gray-400">Costo de 1 ciclo perdido completo</dt>
              <dd class="font-mono font-semibold text-gray-100">
                {{ formatCurrencyCOP(bankrollResult.cycleLossCost) }}
              </dd>
            </div>
            <div class="flex items-center justify-between gap-2">
              <dt class="text-gray-400">
                Costo de {{ bankrollResult.cyclesToSurvive }} ciclos perdidos consecutivos
              </dt>
              <dd class="font-mono font-semibold text-bbp-banker">
                {{ formatCurrencyCOP(bankrollResult.totalLossCost) }}
              </dd>
            </div>
            <div class="flex items-center justify-between gap-2 border-t border-bbp-border pt-1.5">
              <dt class="text-gray-400">Saldo inicial</dt>
              <dd class="font-mono font-semibold text-gray-100">
                {{ formatCurrencyCOP(bankrollResult.balance) }}
              </dd>
            </div>
            <div class="flex items-center justify-between gap-2">
              <dt class="text-gray-400">
                Saldo estimado tras {{ bankrollResult.cyclesToSurvive }} ciclos perdidos
              </dt>
              <dd class="font-mono font-semibold text-bbp-active">
                {{ formatCurrencyCOP(bankrollResult.remainingBalance) }}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div
        v-else
        class="mx-auto mt-6 max-w-sm rounded-lg border border-bbp-banker/40 bg-bbp-banker/10 p-4 text-center"
      >
        <p class="text-sm font-bold tracking-wider text-bbp-banker">
          TU SALDO NO ALCANZA PARA UNA APUESTA BASE CON ESTE PERFIL
        </p>
        <p class="mt-2 text-xs text-gray-300">
          Con el perfil {{ selectedProfile.label.toLowerCase() }} (soporta
          {{ bankrollResult.cyclesToSurvive }} ciclos perdidos consecutivos) necesitas un saldo
          mínimo de {{ formatCurrencyCOP(bankrollResult.minBalanceRequired) }}. Te faltan
          {{ formatCurrencyCOP(bankrollResult.missingAmount) }}, o puedes elegir un perfil más
          agresivo que exija menos capital.
        </p>
      </div>

      <!-- Stop Loss / Take Profit -->
      <div class="mx-auto mt-6 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="rounded-lg border border-bbp-banker/40 bg-bbp-banker/5 p-4 text-center">
          <p class="text-xs font-bold tracking-[0.15em] text-bbp-banker">STOP LOSS</p>
          <p class="mt-3 text-xs text-gray-400">Detente por pérdidas si tu saldo llega a:</p>
          <p
            class="mt-1 text-3xl font-bold text-bbp-banker sm:text-4xl [text-shadow:0_0_14px_currentColor]"
          >
            {{ formatCurrencyCOP(sessionLimits.stopLossBalance) }}
          </p>
          <p class="mt-3 text-[0.6875rem] leading-relaxed text-gray-400">
            Has alcanzado tu límite de pérdida para esta sesión. No continúes operando hoy.
          </p>
          <dl class="mt-3 space-y-1 border-t border-bbp-border pt-3 text-left text-xs">
            <div class="flex items-center justify-between gap-2">
              <dt class="text-gray-500">Saldo inicial</dt>
              <dd class="font-mono font-semibold text-gray-100">
                {{ formatCurrencyCOP(sessionLimits.initialBalance) }}
              </dd>
            </div>
            <div class="flex items-center justify-between gap-2">
              <dt class="text-gray-500">Porcentaje seleccionado</dt>
              <dd class="font-mono font-semibold text-gray-100">
                {{ sessionLimits.profile.stopLossPct }}%
              </dd>
            </div>
            <div class="flex items-center justify-between gap-2">
              <dt class="text-gray-500">Pérdida máxima permitida</dt>
              <dd class="font-mono font-semibold text-bbp-banker">
                {{ formatCurrencyCOP(sessionLimits.maxLoss) }}
              </dd>
            </div>
          </dl>
        </div>

        <div class="rounded-lg border border-bbp-active/40 bg-bbp-active/5 p-4 text-center">
          <p class="text-xs font-bold tracking-[0.15em] text-bbp-active">TAKE PROFIT</p>
          <p class="mt-3 text-xs text-gray-400">Detente por ganancias si tu saldo llega a:</p>
          <p
            class="mt-1 text-3xl font-bold text-bbp-active sm:text-4xl [text-shadow:0_0_14px_currentColor]"
          >
            {{ formatCurrencyCOP(sessionLimits.takeProfitBalance) }}
          </p>
          <p class="mt-3 text-[0.6875rem] leading-relaxed text-gray-400">
            Has alcanzado tu objetivo de la sesión. Considera cerrar la sesión y asegurar el
            resultado.
          </p>
          <dl class="mt-3 space-y-1 border-t border-bbp-border pt-3 text-left text-xs">
            <div class="flex items-center justify-between gap-2">
              <dt class="text-gray-500">Saldo inicial</dt>
              <dd class="font-mono font-semibold text-gray-100">
                {{ formatCurrencyCOP(sessionLimits.initialBalance) }}
              </dd>
            </div>
            <div class="flex items-center justify-between gap-2">
              <dt class="text-gray-500">Porcentaje seleccionado</dt>
              <dd class="font-mono font-semibold text-gray-100">
                {{ sessionLimits.profile.takeProfitPct }}%
              </dd>
            </div>
            <div class="flex items-center justify-between gap-2">
              <dt class="text-gray-500">Ganancia objetivo</dt>
              <dd class="font-mono font-semibold text-bbp-active">
                {{ formatCurrencyCOP(sessionLimits.targetGain) }}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Seguimiento en tiempo real -->
      <div class="mx-auto mt-6 max-w-sm">
        <label
          for="risk-current-balance"
          class="block text-xs font-bold tracking-[0.15em] text-gray-400"
        >
          SALDO ACTUAL (OPCIONAL)
        </label>
        <div class="relative mt-1.5">
          <span
            class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-semibold text-gray-500"
            aria-hidden="true"
          >
            $
          </span>
          <input
            id="risk-current-balance"
            type="text"
            inputmode="numeric"
            autocomplete="off"
            placeholder="Ej: 100.000"
            class="w-full rounded-md border border-bbp-border-strong bg-bbp-bg/80 py-2.5 pr-3 pl-7 text-sm font-semibold text-gray-100 outline-none transition-colors duration-150 focus-visible:border-bbp-focus focus-visible:ring-2 focus-visible:ring-bbp-focus/40"
            :value="rawCurrentInput"
            @input="handleCurrentInput"
          />
        </div>
        <p class="mt-1.5 text-xs text-gray-500">
          Ingresa tu saldo en este momento para ver en qué estado estás frente a tu plan de sesión.
        </p>
      </div>

      <div
        v-if="statusResult"
        aria-live="polite"
        class="mx-auto mt-4 max-w-sm rounded-lg border p-4 text-center"
        :class="[STATUS_CONFIG[statusResult.status].border, STATUS_CONFIG[statusResult.status].bg]"
      >
        <p
          class="flex items-center justify-center gap-1.5 text-sm font-bold tracking-wider"
          :class="STATUS_CONFIG[statusResult.status].text"
        >
          <AppIcon :name="STATUS_CONFIG[statusResult.status].icon" :size="15" />
          {{ STATUS_CONFIG[statusResult.status].title }}
        </p>
        <p v-if="STATUS_CONFIG[statusResult.status].message" class="mt-2 text-xs text-gray-300">
          {{ STATUS_CONFIG[statusResult.status].message }}
        </p>
        <dl v-if="statusResult.status === 'safe-zone'" class="mt-3 grid grid-cols-2 gap-3">
          <div>
            <dt class="text-[0.625rem] font-bold tracking-wider text-gray-500">
              PUEDES PERDER AÚN
            </dt>
            <dd class="mt-0.5 font-mono text-sm font-semibold text-bbp-banker">
              {{ formatCurrencyCOP(statusResult.remainingToStopLoss) }}
            </dd>
          </div>
          <div>
            <dt class="text-[0.625rem] font-bold tracking-wider text-gray-500">
              TE FALTA PARA TAKE PROFIT
            </dt>
            <dd class="mt-0.5 font-mono text-sm font-semibold text-bbp-active">
              {{ formatCurrencyCOP(statusResult.remainingToTakeProfit) }}
            </dd>
          </div>
        </dl>
      </div>
    </template>

    <!-- Contexto del sistema (datos reales) -->
    <div class="mx-auto mt-6 max-w-sm rounded-md border border-bbp-border bg-bbp-bg/40 p-3">
      <p class="text-center text-[0.625rem] font-bold tracking-[0.15em] text-gray-500">
        CONTEXTO DEL SISTEMA
      </p>

      <p
        v-if="store.summaryLoading && !contextStats"
        class="mt-2 text-center text-[0.6875rem] text-gray-500"
      >
        Cargando estadísticas del sistema…
      </p>
      <p v-else-if="!contextStats" class="mt-2 text-center text-[0.6875rem] text-gray-500">
        Aún no hay estadísticas disponibles.
      </p>
      <template v-else>
        <dl class="mt-2 grid grid-cols-2 gap-2 text-center text-[0.6875rem] sm:grid-cols-4">
          <div>
            <dt class="text-gray-500">Efectividad observada</dt>
            <dd class="mt-0.5 font-mono font-semibold text-gray-300">{{ effectivenessLabel }}%</dd>
          </div>
          <div>
            <dt class="text-gray-500">Ganadas</dt>
            <dd class="mt-0.5 font-mono font-semibold text-gray-300">
              {{ contextStats.wonOperations }}
            </dd>
          </div>
          <div>
            <dt class="text-gray-500">Perdidas</dt>
            <dd class="mt-0.5 font-mono font-semibold text-gray-300">
              {{ contextStats.lostOperations }}
            </dd>
          </div>
          <div>
            <dt class="text-gray-500">Operaciones</dt>
            <dd class="mt-0.5 font-mono font-semibold text-gray-300">
              {{ contextStats.totalOperations }}
            </dd>
          </div>
        </dl>
      </template>

      <p class="mt-2 text-center text-[0.625rem] text-gray-500">
        Estrategia con progresión máxima {{ galeProgressionLabel }}.
      </p>
      <p class="mt-2 text-center text-[0.625rem] leading-relaxed text-gray-500 italic">
        Las estadísticas representan resultados históricos observados (canal oficial, en vivo) y no
        garantizan resultados futuros.
      </p>
    </div>
  </section>
</template>
