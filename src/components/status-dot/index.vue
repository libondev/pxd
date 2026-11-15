<script lang="ts" setup>
import type { StatusDotProps } from './types'
import { computed } from 'vue'
import { capitalize as capitalizeText } from '../../utils/format.js'

defineOptions({
  name: 'PStatusDot',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<StatusDotProps>(), {
  label: false,
  state: 'QUEUED',
})

const stateClassNames = {
  READY: 'is-ready bg-teal-600',
  ERROR: 'is-error bg-red-700',
  QUEUED: 'is-queued bg-gray-alpha-200',
  CANCELED: 'is-canceled bg-gray-alpha-400',
  BUILDING: 'is-building bg-amber-600',
}

const labelText = computed(() =>
  typeof props.label === 'string' || typeof props.label === 'number'
    ? props.label
    : capitalizeText(props.state),
)
</script>

<template>
  <span data-status-dot class="pxd-state-dot inline-flex items-center" v-bind="$attrs">
    <i
      aria-hidden="true"
      class="w-2.5 h-2.5 inline-block rounded-full"
      :class="stateClassNames[state]"
    />

    <span v-if="label" class="ps-2 pe-1 min-w-0 text-sm truncate">
      {{ labelText }}
    </span>
  </span>
</template>
