<script setup lang="ts">
import { useDashboardStore } from '@/stores/dashboard'
import OutcomeBadge from '@/components/ui/OutcomeBadge.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'

const store = useDashboardStore()
</script>

<template>
  <section class="operation-card" aria-label="Estado de operación actual">
    <h2 class="operation-card__title">Operación Actual</h2>
    <div class="operation-card__body">
      <div class="operation-card__row">
        <span class="operation-card__label">Objetivo</span>
        <div class="operation-card__outcome">
          <OutcomeBadge :outcome="store.currentOperation.targetOutcome" size="md" />
          <span>{{ store.currentOperation.targetName }}</span>
        </div>
      </div>
      <div class="operation-card__row">
        <span class="operation-card__label">Tras</span>
        <div class="operation-card__outcome">
          <OutcomeBadge :outcome="store.currentOperation.triggerAfterOutcome" size="sm" />
          <span>{{ store.currentOperation.triggerAfterName }}</span>
        </div>
      </div>
      <div class="operation-card__row">
        <span class="operation-card__label">Estado</span>
        <StatusBadge :state="store.currentOperation.state" />
      </div>
      <div v-if="store.currentOperation.progressStep !== undefined" class="operation-card__row">
        <span class="operation-card__label">Progreso</span>
        <ProgressBar
          :value="store.currentOperation.progressStep"
          :label="`${store.currentOperation.progressStep}%`"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.operation-card {
  background: var(--color-surface-dark);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 16px;
}

.operation-card__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 12px;
}

.operation-card__body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.operation-card__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.operation-card__label {
  font-size: 12px;
  color: var(--color-text-muted);
  text-transform: uppercase;
}

.operation-card__outcome {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-primary);
  font-weight: 500;
}
</style>
