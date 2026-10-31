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
    class="pxd-list-group px-2 py-1 flex items-center text-[0.8125rem] leading-inherit text-foreground-secondary"
    v-bind="$attrs"
  >
    {{ label }}
  </div>
</template>
