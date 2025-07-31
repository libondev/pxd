<script setup lang="ts">
import { capitalize as capitalizeText } from '../../utils/format'

interface Props {
  label?: boolean | string
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
  READY: 'bg-green-600',
  ERROR: 'bg-red-600',
  QUEUED: 'bg-gray-alpha-400',
  CANCELED: 'bg-gray-alpha-400',
  BUILDING: 'bg-yellow-500',
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
