<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useAccessGate } from '@/composables/useAccessGate'
import { ApiError } from '@/api/client'
import AppIcon from '@/components/icons/AppIcon.vue'
import BrandWordmark from '@/components/bacbopro/BrandWordmark.vue'

interface Props {
  revealing?: boolean
}

withDefaults(defineProps<Props>(), {
  revealing: false,
})

const { unlock } = useAccessGate()

const password = ref('')
const showPassword = ref(false)
const error = ref<string | null>(null)
const submitting = ref(false)
const shake = ref(false)

const canSubmit = computed(() => password.value.trim().length > 0 && !submitting.value)

// Mensaje honesto según lo que realmente falló, en vez de asumir siempre
// "contraseña incorrecta" (un error de servidor o de límite de intentos no
// es lo mismo, y decir lo contrario solo confunde a quien intenta entrar).
function mapErrorMessage(err: unknown): string {
  if (!(err instanceof ApiError)) return 'Ocurrió un error inesperado. Intenta de nuevo.'
  switch (err.code) {
    case 'NETWORK_ERROR':
      return 'No se pudo conectar con el servidor'
    case 'UNAUTHORIZED':
    case 'FORBIDDEN':
      return 'Contraseña incorrecta'
    case 'RATE_LIMITED':
      return 'Demasiados intentos. Espera unos segundos e inténtalo de nuevo.'
    case 'VALIDATION_ERROR':
      return 'Ingresa una contraseña válida'
    case 'INTERNAL':
    case 'UNAVAILABLE':
    case 'DEPENDENCY_DOWN':
      return 'El servidor no está disponible en este momento. Intenta más tarde.'
    default:
      return 'Ocurrió un error inesperado. Intenta de nuevo.'
  }
}

async function triggerShake(): Promise<void> {
  shake.value = false
  await nextTick()
  shake.value = true
}

async function handleSubmit(): Promise<void> {
  if (!canSubmit.value) return
  error.value = null
  submitting.value = true
  try {
    await unlock(password.value)
  } catch (err) {
    error.value = mapErrorMessage(err)
    password.value = ''
    void triggerShake()
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[100] flex min-h-[100dvh] w-full items-center justify-center overflow-hidden bg-black/55 p-4 backdrop-blur-2xl"
    >
      <div
        class="pointer-events-none absolute left-1/2 top-0 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/3 rounded-full opacity-30 blur-3xl"
        style="background: radial-gradient(circle, var(--color-bbp-brand-blue) 0%, transparent 70%)"
        aria-hidden="true"
      />
      <div
        class="pointer-events-none absolute bottom-0 right-1/2 h-[26rem] w-[26rem] translate-x-1/2 translate-y-1/3 rounded-full opacity-20 blur-3xl"
        style="background: radial-gradient(circle, var(--color-bbp-brand-red) 0%, transparent 70%)"
        aria-hidden="true"
      />

      <div
        v-if="revealing"
        class="bbp-glass bbp-elevation-2 relative flex w-full max-w-sm flex-col items-center gap-7 rounded-lg px-7 py-9 sm:px-9 sm:py-11"
      >
        <p class="animate-pulse text-3xl leading-[1.4] tracking-[-0.02em] sm:text-4xl">
          <BrandWordmark />
        </p>
        <p class="text-sm font-medium tracking-wide text-gray-400">Cargando panel…</p>
      </div>

      <form
        v-else
        class="bbp-glass bbp-elevation-2 relative flex w-full max-w-sm flex-col items-center gap-7 rounded-lg px-7 py-9 sm:px-9 sm:py-11"
        :class="{ 'bbp-shake': shake }"
        @animationend="shake = false"
        @submit.prevent="handleSubmit"
      >
        <p class="text-3xl leading-[1.4] tracking-[-0.02em] sm:text-4xl">
          <BrandWordmark />
        </p>

        <div class="flex flex-col items-center gap-2 text-center">
          <h1 class="text-lg font-bold leading-[1.4] tracking-wide text-gray-100">Acceso restringido</h1>
          <p class="text-sm text-gray-400">Ingresa la contraseña para continuar</p>
        </div>

        <div class="flex w-full flex-col gap-4">
          <div class="relative w-full">
            <span
              class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-500"
              aria-hidden="true"
            >
              <AppIcon name="lock" :size="16" />
            </span>
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="Contraseña"
              autofocus
              :disabled="submitting"
              class="w-full rounded-md border border-bbp-border-strong bg-bbp-bg/70 py-2.5 pl-11 pr-11 text-sm font-medium text-gray-100 outline-none transition-colors duration-150 placeholder:text-gray-500 focus-visible:border-bbp-focus focus-visible:ring-2 focus-visible:ring-bbp-focus/40 disabled:opacity-60"
            />
            <button
              type="button"
              :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              class="absolute inset-y-0 right-2 flex items-center px-1 text-gray-500 transition-colors duration-150 hover:text-gray-300 focus-visible:ring-2 focus-visible:ring-bbp-focus/50"
              @click="showPassword = !showPassword"
            >
              <AppIcon :name="showPassword ? 'eye-off' : 'eye'" :size="16" />
            </button>
          </div>

          <button
            type="submit"
            :disabled="!canSubmit"
            class="w-full rounded-md px-3.5 py-2.5 text-sm font-bold tracking-wide text-white transition-all duration-150 hover:brightness-110 active:brightness-95 focus-visible:ring-2 focus-visible:ring-bbp-focus/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bbp-bg disabled:cursor-default disabled:opacity-50 disabled:hover:brightness-100"
            style="
              background: var(--color-bbp-brand-blue);
              box-shadow: 0 4px 16px color-mix(in srgb, var(--color-bbp-brand-blue) 40%, transparent);
            "
          >
            {{ submitting ? 'Verificando…' : 'Entrar' }}
          </button>
        </div>

        <p
          v-if="error"
          role="alert"
          class="flex w-full items-center justify-center gap-1.5 rounded-md border border-bbp-banker/40 bg-bbp-banker/10 px-3 py-2 text-center text-xs font-semibold text-bbp-banker"
        >
          <AppIcon name="error" :size="14" class="shrink-0" />
          <span>{{ error }}</span>
        </p>
      </form>
    </div>
  </Teleport>
</template>
