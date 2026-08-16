<script setup lang="ts">
import type { OperationEntry } from '@/types/bacbopro'
import OperationCard from './OperationCard.vue'

interface Props {
  oficialOperation: OperationEntry | null
  pruebasOperation: OperationEntry | null
  oficialLoading?: boolean
  pruebasLoading?: boolean
  oficialCancelling?: boolean
  pruebasCancelling?: boolean
}

withDefaults(defineProps<Props>(), {
  oficialLoading: false,
  pruebasLoading: false,
  oficialCancelling: false,
  pruebasCancelling: false,
})

const emit = defineEmits<{
  cancelOficial: []
  cancelPruebas: []
}>()
</script>

<template>
  <section aria-label="Operaciones actuales" class="p-3 sm:p-3.5">
    <h2 class="text-center text-sm font-bold tracking-[0.15em] text-gray-300">
      OPERACIONES ACTUALES
    </h2>
    <div class="mt-2.5 grid grid-cols-2 divide-x divide-bbp-border">
      <OperationCard
        :operation="oficialOperation"
        channel-label="OFICIAL"
        :loading="oficialLoading"
        :cancelling="oficialCancelling"
        embedded
        @cancel="emit('cancelOficial')"
      />
      <OperationCard
        :operation="pruebasOperation"
        channel-label="PRUEBAS"
        :loading="pruebasLoading"
        :cancelling="pruebasCancelling"
        embedded
        @cancel="emit('cancelPruebas')"
      />
    </div>
  </section>
</template>
