<script setup lang="ts">
import BrandWordmark from './BrandWordmark.vue'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="w-full border-t border-bbp-border px-3 py-5 sm:px-4 sm:py-6 lg:px-5">
    <div
      class="mx-auto flex w-full max-w-[1600px] flex-col items-center gap-1 text-center text-[0.6875rem] text-gray-500 sm:flex-row sm:justify-between sm:text-xs 2xl:max-w-[1920px] min-[2560px]:max-w-[2400px]"
    >
      <span class="tracking-[-0.02em]"><BrandWordmark /></span>
      <span>© {{ year }} Mk BacBo Bot — Panel interno de métricas</span>
    </div>
  </footer>
</template>
