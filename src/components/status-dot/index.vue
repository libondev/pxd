<script lang="ts" setup>
import type { StatusDotProps } from './types'
import { computed } from 'vue'
import { capitalize as capitalizeText } from '../../utils/format.js'

defineOptions({
  name: 'PStatusDot',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<StatusDotProps>(), {
  showLabel: false,
  status: 'QUEUED',
})

const stateClassNames = {
  READY: 'is-ready bg-teal-600',
  ERROR: 'is-error bg-red-700',
  QUEUED: 'is-queued bg-gray-alpha-200',
  CANCELED: 'is-canceled bg-gray-alpha-400',
  BUILDING: 'is-building bg-amber-600',
}

const labelText = computed(() =>
  props.label !== undefined && props.label !== null && props.label !== ''
    ? props.label
    : capitalizeText(props.status),
)
</script>

<template>
  <span data-status-dot class="pxd-state-dot inline-flex items-center" v-bind="$attrs">
    <i
      aria-hidden="true"
      class="w-2.5 h-2.5 inline-block rounded-full"
      :class="stateClassNames[status]"
    />

    <span
      v-if="showLabel || (label !== undefined && label !== null && label !== '')"
      class="ps-2 pe-1 min-w-0 text-sm truncate"
    >
      {{ labelText }}
    </span>
  </span>
</template>
