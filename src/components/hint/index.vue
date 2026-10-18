<script lang="ts" setup>
import type { HintEmits, HintProps, HintStatus } from './types'
import CrossIcon from '@gdsicon/vue/cross'
import { computed, onBeforeUnmount, shallowRef, watch, watchEffect } from 'vue'
import { TOOLTIP_CONTENT_CLASS, TOOLTIP_VARIANTS } from '../../constants/tooltip-variants.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import PPopover from '../popover/index.vue'

defineOptions({
  name: 'PHint',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<HintProps>(), {
  position: 'top',
  duration: 1000,
  pauseOnHover: true,
})

const emits = defineEmits<HintEmits>()

let closeTimer: ReturnType<typeof setTimeout> | null = null
let closeDeadline = 0
let closeRemaining = 0
let isHovering = false
let promiseToken = 0

const visible = shallowRef(false)
const progressDuration = shallowRef(0)
const progressKey = shallowRef(0)
const status = shallowRef<HintStatus>('idle')
const statusValue = shallowRef<unknown>()
const statusError = shallowRef<unknown>()

const progressVisible = computed(
  () => visible.value && progressDuration.value > 0 && status.value !== 'pending',
)
const statusVariant = computed(() =>
  status.value === 'success' || status.value === 'error' ? status.value : 'default',
)

const computedVariant = computed(() => TOOLTIP_VARIANTS[statusVariant.value])

const contentClassComputed = computed(() => [
  'relative',
  TOOLTIP_CONTENT_CLASS,
  computedVariant.value.base,
  props.contentClass,
])

const configProvider = useConfigProvider()

function restartProgress(duration: number) {
  progressDuration.value = duration
  progressKey.value++
}

function clearCloseTimer() {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
}

function scheduleClose(delay: number) {
  clearCloseTimer()
  closeRemaining = delay

  if (!props.duration || delay <= 0 || isHovering || status.value === 'pending') {
    return
  }

  closeDeadline = Date.now() + delay

  closeTimer = setTimeout(() => {
    closeTimer = null
    visible.value = false
  }, delay)
}

function startCloseTimer() {
  if (visible.value) {
    restartProgress(props.duration)
    scheduleClose(props.duration)
  }
}

function pauseCloseTimer() {
  if (!props.pauseOnHover) {
    return
  }

  isHovering = true

  if (closeTimer) {
    clearCloseTimer()
    closeRemaining = Math.max(0, closeDeadline - Date.now())
  }
}

function resumeCloseTimer() {
  if (!props.pauseOnHover) {
    return
  }

  isHovering = false

  if (!visible.value || closeTimer) {
    return
  }

  scheduleClose(closeRemaining)
}

function handleClose() {
  visible.value = false
}
function subscribePromise(promise: Promise<unknown> | undefined) {
  const token = ++promiseToken

  statusValue.value = undefined
  statusError.value = undefined

  if (!promise) {
    status.value = 'idle'
    return
  }

  status.value = 'pending'

  promise.then(
    (value) => {
      if (token !== promiseToken) {
        return
      }

      statusValue.value = value
      status.value = 'success'
      startCloseTimer()
    },
    (error) => {
      if (token !== promiseToken) {
        return
      }

      statusError.value = error
      status.value = 'error'
      startCloseTimer()
    },
  )
}

watch(visible, (isVisible) => {
  if (isVisible) {
    startCloseTimer()
  } else {
    clearCloseTimer()
    isHovering = false
    emits('close')
  }
})

// Don't use watch(() => props.promise): Vue will attach a catch to the promise returned by the watcher getter,
// and an error will be reported in the component when it rejects.
watchEffect(() => {
  subscribePromise(props.promise)
})

watch(
  () => props.content,
  () => {
    if (isHovering) {
      closeRemaining = props.duration
      restartProgress(props.duration)
      return
    }

    startCloseTimer()
  },
)

onBeforeUnmount(() => {
  clearCloseTimer()
  promiseToken++
})
</script>

<template>
  <PPopover
    data-hint
    role="tooltip"
    class="pxd-hint"
    show-arrow
    :data-variant="statusVariant"
    :model-value="visible"
    :position="position"
    :toggle-on-trigger="false"
    :fill-trigger-width="false"
    wrapper-class="max-sm:data-[position^=top]:px-1 max-sm:data-[position^=bottom]:px-1 max-sm:data-[position^=left]:ps-1 max-sm:data-[position^=right]:pe-1"
    :arrow-color="computedVariant.bg"
    :content-class="contentClassComputed"
    v-bind="$attrs"
    trigger="click"
    :close-on-press-escape="false"
    :close-on-outside-click="false"
    @trigger-click="startCloseTimer"
    @update:model-value="visible = $event"
  >
    <slot :status="status" />

    <template #content="{ activeTrigger, activeTriggerIndex }">
      <div
        class="pxd-hint--content gap-1.5 flex items-center"
        :data-pause-on-hover="pauseOnHover ? 'true' : 'false'"
        @pointerenter="pauseCloseTimer"
        @pointerleave="resumeCloseTimer"
      >
        <slot
          name="content"
          :status="status"
          :value="statusValue"
          :error="statusError"
          :active-trigger="activeTrigger"
          :active-trigger-index="activeTriggerIndex"
        >
          {{ content }}
        </slot>

        <button
          v-if="closeable"
          type="button"
          class="pxd-hint--close p-0.5 shrink-0 cursor-pointer appearance-none rounded-sm border-0 bg-transparent font-inherit text-inherit opacity-70 self-focus-ring outline-none hover:opacity-100 motion-safe:transition-opacity"
          :aria-label="configProvider.locale.feedback.close"
          @click="handleClose"
        >
          <CrossIcon class="size-3" />
        </button>

        <div
          v-if="progressVisible"
          :key="progressKey"
          aria-hidden="true"
          class="pxd-hint--progress-bar pxd-countdown-progress inset-x-0 top-0 h-0.5 absolute bg-current"
          :style="{ animationDuration: `${progressDuration}ms` }"
        />
      </div>
    </template>
  </PPopover>
</template>

<style lang="postcss">
.pxd-hint--content[data-pause-on-hover='true']:hover .pxd-hint--progress-bar {
  animation-play-state: paused;
}
</style>
