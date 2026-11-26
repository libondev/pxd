<script lang="ts" setup>
import type { LoadingBarEventParams } from '../../composables/use-loading-bar'
import type { LoadingBarProps } from './types'
import { onBeforeUnmount, onMounted } from 'vue'
import { useLoadingBarProgress } from '../../composables/_internal/use-loading-bar-progress.js'
import { useTailwindVariant } from '../../composables/_internal/use-tailwind-variant.js'
import { UPDATE_LOADING_BAR_EVENT_NAME } from '../../composables/use-loading-bar.js'
import { cachedOff, cachedOn } from '../../utils/event.js'

defineOptions({
  name: 'PLoadingBar',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<LoadingBarProps>(), {
  to: 'body',
  group: 'default',
  minimum: 0.08,
  trickle: true,
  hideDelay: 500,
  trickleThreshold: 300,
})

const {
  status,
  hidden: hiddenBar,
  progress: progressValue,
  enableTransition,
  start,
  finish,
  error,
  increase,
} = useLoadingBarProgress({
  minimum: () => props.minimum,
  trickle: () => props.trickle,
  trickleThreshold: () => props.trickleThreshold,
  hideDelay: () => props.hideDelay,
})

const { attrs, classes } = useTailwindVariant(
  {
    base: 'pxd-loading-bar top-0 left-0 right-0 pointer-events-none z-10 max-w-full overflow-hidden',
    variants: {
      locally: {
        true: 'absolute',
        false: 'fixed',
      },
    },
  },
  {
    selection: () => ({ locally: props.to !== 'body' }),
  },
)
const { classes: innerClasses } = useTailwindVariant(
  {
    base: 'pxd-loading-bar--inner h-0.5 data-[hidden=true]:h-0 origin-left data-[transition=false]:transition-none! data-[transition=true]:will-change-transform motion-safe:transition-appearance',
    variants: {
      status: {
        running: 'bg-gray-500',
        finish: 'bg-primary',
        error: 'bg-red-900',
      },
    },
  },
  {
    mergeAttrsClass: false,
    selection: () => ({ status: status.value }),
  },
)

function onUpdateLoadingBar({ detail }: CustomEvent<LoadingBarEventParams>) {
  if (detail.group !== props.group) {
    return
  }

  switch (detail.type) {
    case 'start':
      start()
      break
    case 'error':
      error()
      break
    case 'finish':
      finish()
      break
    case 'increase':
      increase(detail.value)
      break
  }
}

onMounted(() => {
  cachedOn(window, UPDATE_LOADING_BAR_EVENT_NAME, onUpdateLoadingBar)
})

onBeforeUnmount(() => {
  cachedOff(window, UPDATE_LOADING_BAR_EVENT_NAME, onUpdateLoadingBar)
})
</script>

<template>
  <Teleport :to="to">
    <div data-loading-bar aria-hidden="true" :class="classes" v-bind="attrs">
      <div
        :data-hidden="hiddenBar"
        :data-transition="enableTransition"
        :class="innerClasses"
        :style="{ transform: `scaleX(${progressValue})` }"
      />
    </div>
  </Teleport>
</template>
