<script setup lang="ts">
import type { ComponentLabel } from 'dist/index'
import { capitalize as capitalizeText } from '../../utils/format'

interface Props {
  label?: boolean | ComponentLabel
  state?: 'QUEUED' | 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED'
}

const props = withDefaults(
  defineProps<Props>(),
  {
    label: false,
    state: 'QUEUED',
  },
)

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
  <span class="pxd-state-dot inline-flex items-center">
    <i aria-hidden="true" class="w-2.5 h-2.5 inline-block rounded-full" :class="stateClassNames[state]" />

    <span v-if="label" class="pl-2 pr-1 min-w-0 text-sm truncate after:content-[attr(aria-label)]">
      {{ getLabelText() }}
    </span>
  </span>
</template>
