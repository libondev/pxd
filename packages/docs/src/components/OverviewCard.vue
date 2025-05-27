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
  <RouterLink
    :to="getPath(name)"
    class="pxd-link-button border rounded-lg w-full md:w-[calc(50%-1rem)] lg:w-[calc(25%-1rem)] !no-underline cursor-pointer hover:bg-background-secondary motion-safe:transition-colors not-hover:transition-none overflow-hidden"
  >
    <div class="border-b border-dashed truncate px-4 py-2">
      {{ name }}
    </div>

    <div class="p-4">
      <PText truncate="2" secondary>
        <slot />
      </PText>
    </div>
  </RouterLink>
</template>
