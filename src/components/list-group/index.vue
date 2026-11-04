<script lang="ts" setup>
import type { ListGroupProps } from './types'

defineOptions({
  name: 'PListGroup',
  inheritAttrs: false,
})

defineProps<ListGroupProps>()
</script>

<template>
  <div
    role="group"
    data-list-group
    :aria-label="label"
    class="pxd-list-group px-2 py-1 text-xs flex items-center text-foreground-secondary"
    v-bind="$attrs"
  >
    {{ label }}
  </div>
</template>
