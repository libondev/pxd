<script lang="ts" setup>
import type { LoadingBarEventParams } from '../../composables/use-loading-bar'
import { computed, onBeforeUnmount, onMounted, shallowRef } from 'vue'
import {
  ERROR_LOADING_BAR_EVENT_NAME,
  FINISH_LOADING_BAR_EVENT_NAME,
  INCREASE_LOADING_BAR_EVENT_NAME,
  START_LOADING_BAR_EVENT_NAME,
} from '../../composables/use-loading-bar'
import { off, on } from '../../utils/event'
import { isServer } from '../../utils/is'
import PTeleport from '../teleport/index.vue'

interface Props {
  to?: string | HTMLElement
  group?: string
  minimum?: number
  trickle?: boolean
  trickleThreshold?: number
}

defineOptions({
  name: 'PLoadingBar',
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<Props>(),
  {
    group: 'default',
    speed: 300,
    minimum: 0.08,
    trickle: true,
    trickleThreshold: 300,
  },
)

let prevTimestamp = 0
let prevAnimationKey = 0

type Status = 'idle' | 'running' | 'error' | 'finish'

const status = shallowRef<Status>('idle')
const progress = shallowRef(0)

const computedClass = computed(() => {
  const _status = status.value

  return {
    'bg-primary': _status === 'running',
    'bg-red-900 animate-[loading-bar-hide_1s_forwards]': _status === 'error',
    'bg-primary animate-[loading-bar-hide_1s_forwards]': _status === 'finish',
  }
})

function clamp(n: number, min: number, max: number) {
  if (n < min) {
    return min
  } else if (n > max) {
    return max
  }
  return n
}

function getIncreaseDelta(n: number) {
  if (n >= 0 && n < 0.2) {
    return 0.1
  } else if (n >= 0.2 && n < 0.5) {
    return 0.04
  } else if (n >= 0.5 && n < 0.8) {
    return 0.02
  } else if (n >= 0.8 && n < 0.98) {
    return 0.005
  } else {
    return 0
  }
}

function increaseProgress(n?: number) {
  if (progress.value >= 1) {
    cancelAnimationFrame(prevAnimationKey)
    return
  }

  const now = performance.now()
  const delta = now - prevTimestamp
  const threshold = props.trickleThreshold || 200

  if (delta < threshold && props.trickle) {
    prevAnimationKey = requestAnimationFrame(increaseProgress)
    return
  }

  prevTimestamp = now
  const amount = n || getIncreaseDelta(progress.value)
  progress.value = clamp(progress.value + amount, 0, 0.994)

  if (amount === 0 || !props.trickle) {
    return
  }

  prevAnimationKey = requestAnimationFrame(increaseProgress)
}

function onAnimationEnd() {
  status.value = 'idle'
  progress.value = 0
}

function onStartProgress({ detail }: CustomEvent<LoadingBarEventParams>) {
  if (!detail || detail.group !== props.group) {
    return
  }

  status.value = 'running'

  // Set the initial value to avoid starting with nothing when manual control
  progress.value = props.minimum

  if (!props.trickle) {
    return
  }

  prevTimestamp = 0

  requestAnimationFrame(increaseProgress)
}

function onErrorProgress({ detail }: CustomEvent<LoadingBarEventParams>) {
  if (!detail || detail.group !== props.group) {
    return
  }

  cancelAnimationFrame(prevAnimationKey)
  status.value = 'error'
  progress.value = 1
}

function onFinishProgress({ detail }: CustomEvent<LoadingBarEventParams>) {
  if (!detail || detail.group !== props.group) {
    return
  }

  cancelAnimationFrame(prevAnimationKey)
  status.value = 'finish'
  progress.value = 1
}

function onIncreaseProgress({ detail }: CustomEvent<LoadingBarEventParams>) {
  if (!detail || detail.group !== props.group) {
    return
  }

  increaseProgress(detail.value)
}

onMounted(() => {
  if (isServer) {
    return
  }

  on(window, START_LOADING_BAR_EVENT_NAME, onStartProgress)
  on(window, ERROR_LOADING_BAR_EVENT_NAME, onErrorProgress)
  on(window, FINISH_LOADING_BAR_EVENT_NAME, onFinishProgress)
  on(window, INCREASE_LOADING_BAR_EVENT_NAME, onIncreaseProgress)
})

onBeforeUnmount(() => {
  off(window, START_LOADING_BAR_EVENT_NAME, onStartProgress)
  off(window, ERROR_LOADING_BAR_EVENT_NAME, onErrorProgress)
  off(window, FINISH_LOADING_BAR_EVENT_NAME, onFinishProgress)
  off(window, INCREASE_LOADING_BAR_EVENT_NAME, onIncreaseProgress)
})
</script>

<template>
  <PTeleport :to="to">
    <div aria-hidden="true" class="pxd-loading-bar top-0 left-0 right-0 h-0.5 pointer-events-none fixed z-10 max-w-full overflow-hidden" v-bind="$attrs">
      <div
        class="pxd-loading-bar--inner size-full origin-left rounded-r-full motion-safe:transition-all"
        :class="computedClass"
        :style="{ transform: `scaleX(${progress})` }"
        @animationend="onAnimationEnd"
      />
    </div>
  </PTeleport>
</template>

<style>
@keyframes loading-bar-hide {
  0%, 25% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}
</style>
