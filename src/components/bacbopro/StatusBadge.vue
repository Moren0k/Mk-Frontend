<script setup lang="ts">
interface Props {
  text: string
  active?: boolean
}

withDefaults(defineProps<Props>(), {
  active: true,
})
</script>

<template>
  <span
    class="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-bbp-border bg-bbp-bg px-3 py-1.5 text-[0.625rem] font-semibold tracking-wider text-gray-300 sm:px-3.5 sm:text-[0.6875rem]"
  >
    <span
      class="h-2 w-2 rounded-full"
      :class="active ? 'bbp-pulse bg-bbp-active' : 'bg-bbp-banker'"
      aria-hidden="true"
    />
    {{ text }}
  </span>
</template>
