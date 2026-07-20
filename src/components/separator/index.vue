<script lang="ts" setup>
import type { SeparatorProps } from './types'

defineOptions({
  name: 'PSeparator',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<SeparatorProps>(), {
  direction: 'vertical',
})
</script>

<template>
  <div
    role="separator"
    :aria-orientation="direction"
    class="pxd-separator aria-[orientation=vertical]:h-3 box-border inline-block shrink-0 border-0 border-gray-300 leading-inherit aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:border-t aria-[orientation=vertical]:border-l aria-[orientation=vertical]:border-gray-500"
    v-bind="$attrs"
  />
</template>
