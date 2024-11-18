<script setup lang="ts">
defineProps<{
  title?: string
  heading?: boolean
  description?: string
}>()
</script>

<template>
  <div class="p-12 border-b">
    <component :is="heading ? 'h1' : 'h2'" class="text-3xl font-semibold">
      {{ title }}
    </component>
    <p v-if="description" class="text-lg text-gray-800 mt-2 xl:mt-4">
      {{ description }}
    </p>

    <div v-if="$slots.default" class="mt-4 xl:mt-7">
      <slot />
    </div>
  </div>
</template>
