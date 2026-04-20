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
    class="pxd-separator aria-[orientation=horizontal]:min-w-3 aria-[orientation=vertical]:min-h-3 bg-gray-300 leading-inherit aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=vertical]:h-full aria-[orientation=vertical]:w-px"
    v-bind="$attrs"
  />
</template>
