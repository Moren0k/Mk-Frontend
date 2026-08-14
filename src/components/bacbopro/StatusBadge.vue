<script setup lang="ts">
interface Props {
  text: string
  variant: 'sync' | 'vip'
}

defineProps<Props>()
</script>

<template>
  <span
    class="inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wider sm:px-3 sm:text-[11px]"
    :class="
      variant === 'sync'
        ? 'border-bbp-border bg-bbp-bg text-gray-300'
        : 'border-bbp-tie/40 bg-bbp-tie/10 text-bbp-tie'
    "
  >
    <span
      v-if="variant === 'sync'"
      class="bbp-pulse h-2 w-2 rounded-full bg-bbp-active"
      aria-hidden="true"
    />
    {{ text }}
  </span>
</template>
