<script setup lang="ts">
export type IconName =
  | 'alert'
  | 'strategy'
  | 'pattern'
  | 'entry'
  | 'bet'
  | 'repeat'
  | 'check'
  | 'close'
  | 'info'
  | 'warning'
  | 'error'
  | 'success'
  | 'logout'
  | 'lock'
  | 'eye'
  | 'eye-off'

interface Props {
  name: IconName
  size?: number | string
}

withDefaults(defineProps<Props>(), {
  size: 16,
})
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="shrink-0"
    aria-hidden="true"
  >
    <template v-if="name === 'alert'">
      <path d="M12 3 2 20h20L12 3Z" />
      <path d="M12 10v4" />
      <path d="M12 17.5v.01" />
    </template>

    <template v-else-if="name === 'strategy'">
      <path d="M4 20V10" />
      <path d="M11 20V4" />
      <path d="M18 20v-7" />
    </template>

    <template v-else-if="name === 'pattern'">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m20 20-4.7-4.7" />
    </template>

    <template v-else-if="name === 'entry'">
      <path d="M4 4v10a4 4 0 0 0 4 4h11" />
      <path d="m14 13 5 5-5 5" />
    </template>

    <template v-else-if="name === 'bet'">
      <path
        d="M12 2c1.6 3 1 4.6-.2 6.2C10.6 10 9 11.6 9 14a3 3 0 0 0 6 0c0-1-.4-1.7-.9-2.4.9.6 1.9 1.8 1.9 3.4a5 5 0 0 1-10 0c0-4.6 4-6 4.5-9.6A4 4 0 0 1 12 2Z"
      />
    </template>

    <template v-else-if="name === 'repeat'">
      <path d="m17 2 4 4-4 4" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <path d="m7 22-4-4 4-4" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </template>

    <template v-else-if="name === 'check' || name === 'success'">
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 5-5.5" />
    </template>

    <template v-else-if="name === 'close'">
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </template>

    <template v-else-if="name === 'info'">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5" />
      <path d="M12 7.5v.01" />
    </template>

    <template v-else-if="name === 'warning'">
      <path d="M12 3 2 20h20L12 3Z" />
      <path d="M12 10v4" />
      <path d="M12 17.5v.01" />
    </template>

    <template v-else-if="name === 'error'">
      <circle cx="12" cy="12" r="9" />
      <path d="m9 9 6 6" />
      <path d="m15 9-6 6" />
    </template>

    <template v-else-if="name === 'logout'">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </template>

    <template v-else-if="name === 'lock'">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </template>

    <template v-else-if="name === 'eye'">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </template>

    <template v-else-if="name === 'eye-off'">
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a3 3 0 0 0 4.24 4.24" />
      <path
        d="M9.9 4.24A10.9 10.9 0 0 1 12 4c6.5 0 10 8 10 8a18.5 18.5 0 0 1-4.22 5.06M6.1 6.1C3.51 7.74 2 12 2 12s1.2 2.7 3.6 4.8"
      />
    </template>
  </svg>
</template>
