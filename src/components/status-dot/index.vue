<script lang="ts" setup>
import type { StatusDotProps } from './types'
import { capitalize as capitalizeText } from '../../utils/format'

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

function getLabelText() {
  const { label, state } = props

  if (!label) {
    return ''
  }

  if (typeof label === 'boolean') {
    return capitalizeText(state)
  }

  return label
}
</script>

<template>
  <span class="pxd-state-dot inline-flex items-center" v-bind="$attrs">
    <i
      aria-hidden="true"
      class="w-2.5 h-2.5 inline-block rounded-full"
      :class="stateClassNames[state]"
    />

    <span v-if="label" class="ps-2 pe-1 min-w-0 text-sm truncate after:content-[attr(aria-label)]">
      {{ getLabelText() }}
    </span>
  </span>
</template>
