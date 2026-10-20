<script lang="ts" setup>
import type { ListGroupProps } from './types'
import { computed } from 'vue'
import { BASIC_MIN_HEIGHTS } from '../../constants/size.js'
import { useConfigProvider } from '../../contexts/config-provider.js'

defineOptions({
  name: 'PListGroup',
  inheritAttrs: false,
})

defineProps<ListGroupProps>()

const configProvider = useConfigProvider()
const minHeightClass = computed(() => BASIC_MIN_HEIGHTS[configProvider.size])
</script>

<template>
  <div
    role="group"
    data-list-group
    :aria-label="label"
    class="pxd-list-group px-2 py-1 flex items-center text-13px text-foreground-secondary"
    :class="minHeightClass"
    v-bind="$attrs"
  >
    {{ label }}
  </div>
</template>
