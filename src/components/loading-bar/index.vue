transition-appearance<script lang="ts" setup>
import type { LoadingBarEventParams } from '../../composables/use-loading-bar'
import type { LoadingBarProps, LoadingBarStatus } from './types'
import { tv } from 'tailwind-variants'
import { computed, onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { UPDATE_LOADING_BAR_EVENT_NAME } from '../../composables/use-loading-bar'
import { cachedOff, cachedOn } from '../../utils/event'
import { clampValue, isTruthyProp } from '../../utils/format'
import { isServer } from '../../utils/is'
import PTeleport from '../teleport/index.vue'

defineOptions({
  name: 'PLoadingBar',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<LoadingBarProps>(), {
  group: 'default',
  speed: 300,
  minimum: 0.08,
  trickle: true,
  hideDelay: 500,
  trickleThreshold: 300,
})

const loadingBarVariant = tv({
  slots: {
    wrapper:
      'pxd-loading-bar top-0 left-0 right-0 pointer-events-none z-10 max-w-full overflow-hidden',
    inner:
      'pxd-loading-bar--inner h-0.5 data-[hidden=true]:h-0 origin-left data-[transition=false]:transition-none! motion-safe:transition-all',
  },
  variants: {
    status: {
      running: {
        inner: 'bg-gray-500',
      },
      finish: {
        inner: 'bg-primary',
      },
      error: {
        inner: 'bg-red-900',
      },
    },
    absolute: {
      true: {
        wrapper: 'absolute',
      },
      false: {
        wrapper: 'fixed',
      },
    },
  },
  defaultVariants: {
    status: 'finish',
    absolute: false,
  },
})

let prevTimestamp = 0
let prevAnimationKey = 0

let hiddenBarTimeout: ReturnType<typeof setTimeout>
let enableTransitionTimeout: ReturnType<typeof setTimeout>

const ENABLE_TRANSITION_DELAY = 0

const status = shallowRef<LoadingBarStatus>('finish')
const hiddenBar = shallowRef(false)
const progressValue = shallowRef(0)
const enableTransition = shallowRef(false)

const computedClasses = computed(() => {
  return loadingBarVariant({
    status: status.value,
    absolute: isTruthyProp(props.to),
  })
})

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
  if (progressValue.value >= 1) {
    cancelAnimationFrame(prevAnimationKey)
    return
  }

  const now = performance.now()
  const delta = now - prevTimestamp
  const threshold = props.trickleThreshold || 200

  if (delta < threshold && props.trickle) {
    prevAnimationKey = requestAnimationFrame(() => increaseProgress())
    return
  }

  prevTimestamp = now
  const amount = n || getIncreaseDelta(progressValue.value)
  progressValue.value = clampValue(progressValue.value + amount, 0, 0.994)

  if (amount === 0 || !props.trickle) {
    return
  }

  prevAnimationKey = requestAnimationFrame(() => increaseProgress())
}

async function hideAndResetProgress() {
  hiddenBarTimeout = setTimeout(() => {
    hiddenBar.value = true
  }, props.hideDelay)
}

function handleStartProgress() {
  if (status.value === 'running') {
    return
  }

  enableTransition.value = false
  hiddenBar.value = false
  status.value = 'running'

  progressValue.value = props.minimum

  clearTimeout(hiddenBarTimeout)
  clearTimeout(enableTransitionTimeout)
  enableTransitionTimeout = setTimeout(() => {
    enableTransition.value = true
  }, ENABLE_TRANSITION_DELAY)

  if (!props.trickle) {
    return
  }

  prevTimestamp = 0

  requestAnimationFrame(() => increaseProgress())
}

async function handleErrorProgress() {
  if (status.value !== 'running') {
    return
  }

  cancelAnimationFrame(prevAnimationKey)
  status.value = 'error'
  hiddenBar.value = false
  progressValue.value = 1

  hideAndResetProgress()
}

function handleFinishProgress() {
  if (status.value !== 'running') {
    return
  }

  cancelAnimationFrame(prevAnimationKey)
  status.value = 'finish'
  hiddenBar.value = false
  progressValue.value = 1

  hideAndResetProgress()
}

function handleIncreaseProgress(value?: number) {
  increaseProgress(value)
}

function onUpdateLoadingBar({ detail }: CustomEvent<LoadingBarEventParams>) {
  if (detail.group !== props.group) {
    return
  }

  switch (detail.type) {
    case 'start':
      handleStartProgress()
      break
    case 'error':
      handleErrorProgress()
      break
    case 'finish':
      handleFinishProgress()
      break
    case 'increase':
      handleIncreaseProgress(detail.value)
      break
  }
}

onMounted(() => {
  if (isServer()) {
    return
  }

  cachedOn(window, UPDATE_LOADING_BAR_EVENT_NAME, onUpdateLoadingBar)
})

onBeforeUnmount(() => {
  cachedOff(window, UPDATE_LOADING_BAR_EVENT_NAME, onUpdateLoadingBar)
})
</script>

<template>
  <PTeleport :to="to">
    <div aria-hidden="true" :class="computedClasses.wrapper()" v-bind="$attrs">
      <div
        :data-hidden="hiddenBar"
        :data-transition="enableTransition"
        :class="computedClasses.inner()"
        :style="{ transform: `scaleX(${progressValue})` }"
      />
    </div>
  </PTeleport>
</template>
