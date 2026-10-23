<script lang="ts" setup>
import type { TimelineItemProps } from './types'
import { computed } from 'vue'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { getFallbackValue } from '../../utils/helper.js'

defineOptions({
  name: 'PTimelineItem',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<TimelineItemProps>(), {
  timestamp: '',
  placement: 'bottom',
  type: '',
  color: '',
})

const NODE_SIZES = {
  sm: 'min-w-1.5 min-h-1.5',
  md: 'min-w-2 min-h-2',
  lg: 'min-w-2.5 min-h-2.5',
}

const ICON_SIZES = {
  sm: 'size-2',
  md: 'size-3',
  lg: 'size-3.5',
}

const configProvider = useConfigProvider()

const computedSize = computed(() => props.size || configProvider.size)
const nodeSizeClasses = computed(() =>
  getFallbackValue(props.size, NODE_SIZES, configProvider.size),
)
const iconSizeClasses = computed(() =>
  getFallbackValue(props.size, ICON_SIZES, configProvider.size),
)

const nodeClasses = computed(() => [
  `is-${computedSize.value} p-px left-[0.28125rem] -translate-x-1/2 leading-none`,
  nodeSizeClasses.value,
  props.type && `is-${props.type}`,
  { 'is-hollow': props.hollow },
  {
    'bg-primary border-primary': props.type === 'primary',
    'bg-blue-700 border-blue-700': props.type === 'success',
    'bg-amber-700 border-amber-700': props.type === 'warning',
    'bg-red-700 border-red-700': props.type === 'danger',
    'bg-gray-600 border-gray-600': props.type === 'info',
    'bg-gray-400 border-gray-400': !props.type,
    'border-2 border-solid bg-background-100': props.hollow,
  },
])
</script>

<template>
  <li
    data-timeline-item
    class="pxd-timeline-item group/timeline-item pbe-4 last:pbe-0 relative"
    v-bind="$attrs"
  >
    <div
      aria-hidden="true"
      class="pxd-timeline-item--tail left-1 top-0 absolute h-full border-l border-gray-300 group-last/timeline-item:hidden"
    />

    <div
      v-if="!$slots.dot"
      aria-hidden="true"
      class="pxd-timeline-item--node absolute flex items-center justify-center rounded-full text-primary-foreground"
      :class="nodeClasses"
      :style="{ backgroundColor: color, borderColor: color }"
    >
      <Component :is="icon" v-if="icon" class="pxd-timeline-item--icon" :class="iconSizeClasses" />
    </div>
    <div
      v-else
      aria-hidden="true"
      class="pxd-timeline-item--dot left-1.25 absolute flex -translate-x-1/2 items-center justify-center"
    >
      <slot name="dot" />
    </div>

    <div class="pxd-timeline-item--wrapper px-5 -top-1.5 relative">
      <div
        v-if="!hideTimestamp && placement === 'top'"
        class="pxd-timeline-item--timestamp is-top mbe-1 pbs-1 text-xs leading-none text-foreground-secondary"
      >
        {{ timestamp }}
      </div>

      <div class="pxd-timeline-item--content text-foreground">
        <slot />
      </div>

      <div
        v-if="!hideTimestamp && placement === 'bottom'"
        class="pxd-timeline-item--timestamp is-bottom mbs-0.5 text-xs leading-none text-foreground-secondary"
      >
        {{ timestamp }}
      </div>
    </div>
  </li>
</template>
