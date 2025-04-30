<script setup lang="ts">
// eslint-disable-next-line vue/prefer-import-from-vue
import { hyphenate } from '@vue/shared'

defineProps<{
  name: string
}>()

function getPath(name: string) {
  return `/components/${hyphenate(name)}`
}
</script>

<template>
  <RouterLink :to="getPath(name)" class="border rounded-lg w-1/5 !no-underline cursor-pointer hover:bg-background-secondary motion-safe:transition-colors not-hover:transition-none">
    <div class="border-b border-dashed truncate px-4 py-2">
      {{ name }}
    </div>

    <div class="p-4 truncate">
      <slot />
    </div>
  </RouterLink>
</template>
