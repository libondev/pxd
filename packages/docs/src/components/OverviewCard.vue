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
    class="pxd-link-button md:w-[calc(50%-1rem)] lg:w-[calc(25%-1rem)] w-full cursor-pointer overflow-hidden rounded-lg border no-underline! not-hover:transition-none hover:bg-background-200 motion-safe:transition-colors"
  >
    <div class="px-4 py-2 truncate border-b border-dashed">
      {{ name }}
    </div>

    <div class="p-4">
      <PText truncate="2" secondary>
        <slot />
      </PText>
    </div>
  </RouterLink>
</template>
