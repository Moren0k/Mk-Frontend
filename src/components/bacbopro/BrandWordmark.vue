<script setup lang="ts">
// Logotipo de marca reutilizable: "M" y "K" llevan los colores de marca
// (azul/rojo) y el resto del nombre queda en blanco, tal como se definió
// desde el inicio del rebranding. Un solo lugar para no duplicar el marcado
// entre el header y el login.
</script>

<template>
  <span class="font-brand whitespace-nowrap">
    <span style="color: var(--color-bbp-brand-blue)">M</span><span
      style="color: var(--color-bbp-brand-red)"
      >K</span
    ><span class="text-gray-100">BACBOT</span>
  </span>
</template>
