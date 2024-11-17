<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
}>()
</script>

<template>
  <div class="p-12 border-b">
    <slot>
      <h1 class="text-3xl font-semibold mb-3">
        {{ title }}
      </h1>
      <p class="text-lg text-gray-800">
        {{ description }}
      </p>
    </slot>
  </div>
</template>
