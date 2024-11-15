<script setup lang="ts">
interface StatusDotProps {
  label?: boolean | string
  state?: 'QUEUED' | 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED'
}

const {
  label = false,
  state = 'QUEUED',
} = defineProps<StatusDotProps>()

const stateClassNames = {
  READY: 'bg-[#50e3c2]',
  ERROR: 'bg-[#ee0000]',
  QUEUED: 'bg-[#eaeaea]',
  CANCELED: 'bg-[#eaeaea]',
  BUILDING: 'bg-[#f5a623]',
}

function getLabelText(
  state: StatusDotProps['state'],
  label: StatusDotProps['label'],
) {
  if (!label) {
    return ''
  }

  if (typeof label === 'boolean') {
    return state
  }

  return label
}
</script>

<template>
  <span class="pxd-state-dot inline-flex items-center">
    <span class="inline-block w-2.5 h-2.5 rounded-full" :class="stateClassNames[state]" />

    <span v-if="label" class="pl-2 pr-1 min-w-0 text-sm truncate capitalize">
      {{ getLabelText(state, label) }}
    </span>
  </span>
</template>
