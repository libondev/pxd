<script lang="ts" setup>
import type { HoldButtonEmits, HoldButtonProps, HoldButtonStatus } from './types'
import { onBeforeUnmount, shallowRef } from 'vue'
import { caf, raf } from '../../utils/event.js'
import PButton from '../button/index.vue'

defineOptions({
  name: 'PHoldButton',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<HoldButtonProps>(), {
  vibrate: true,
  scalable: true,
})

const emits = defineEmits<HoldButtonEmits>()

const DEFAULT_DURATION = 2000

let activePointerId: number | null = null
let frameId = 0
let held = 0
let lastFrameAt = 0

const status = shallowRef<HoldButtonStatus>('idle')
const progress = shallowRef(0)

function getDuration() {
  const value = Number(props.durations)

  return Number.isFinite(value) && value > 0 ? value : DEFAULT_DURATION
}

function onTriggerVibrate() {
  if (props.vibrate && typeof window.navigator.vibrate === 'function') {
    window.navigator.vibrate(100)
  }
}

function stopProgress() {
  if (!frameId) {
    return
  }

  caf(frameId)
  frameId = 0
}

function startProgress() {
  lastFrameAt = Date.now()

  if (!frameId) {
    frameId = raf(updateProgress)
  }
}

function updateProgress() {
  const now = Date.now()
  const duration = getDuration()

  frameId = 0
  held += now - lastFrameAt
  lastFrameAt = now

  if (held >= duration) {
    progress.value = 1
    status.value = 'confirmed'
    emits('confirm')
    onTriggerVibrate()
    return
  }

  progress.value = held / duration
  frameId = raf(updateProgress)
}

function pauseHold() {
  if (status.value !== 'loading') {
    return
  }

  stopProgress()
  status.value = 'canceled'
}

function resumeHold() {
  if (status.value !== 'canceled') {
    return
  }

  status.value = 'loading'
  startProgress()
}

function onPointerDown(event: PointerEvent) {
  if (props.disabled || event.button !== 0) {
    return
  }

  const target = event.currentTarget as HTMLElement

  // Capture keeps `pointerup` coming when the pointer is released outside the window.
  target.setPointerCapture(event.pointerId)

  activePointerId = event.pointerId
  held = 0
  progress.value = 0
  status.value = 'loading'
  startProgress()

  emits('pointerdown', event)
}

function onPointerMove(event: PointerEvent) {
  if (event.pointerId !== activePointerId) {
    return
  }

  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const isInside =
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom

  if (isInside) {
    resumeHold()
    return
  }

  pauseHold()
}

function onPointerUp(event: PointerEvent) {
  if (event.pointerId !== activePointerId) {
    return
  }

  const heldProgress = progress.value
  const isConfirmed = status.value === 'confirmed'

  activePointerId = null
  stopProgress()
  held = 0
  status.value = 'idle'
  progress.value = 0

  if (!isConfirmed) {
    emits('cancel', heldProgress)
  }

  emits('pointerup', event)
}

onBeforeUnmount(stopProgress)
</script>

<template>
  <PButton
    type="button"
    data-hold-button
    v-bind="$attrs"
    :disabled="disabled"
    :class="[
      'pxd-hold-button relative motion-safe:transition-appearance',
      { scalable, holding: status === 'loading' || status === 'confirmed' },
    ]"
    :style="{ '--hold-button-progress': progress, '--hold-button-progress-color': progressColor }"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @lostpointercapture="onPointerUp"
  >
    <template #prefix>
      <slot name="prefix" />
    </template>

    <slot />

    <template #suffix>
      <slot name="suffix" />
      <div
        class="pxd-hold-button--overlay pointer-events-none absolute -inset-px rounded-inherit bg-(--hold-button-progress-color) default-transition-timing-function!"
        :class="{ confirmed: status === 'confirmed' }"
      />
    </template>
  </PButton>
</template>

<style lang="postcss">
.pxd-hold-button {
  &.scalable:not(.is-disabled):active {
    transform: scale(0.97);
  }

  &:hover .pxd-hold-button--overlay {
    will-change: clip-path;
  }

  .pxd-hold-button--overlay {
    --opacity: 0.45;
    opacity: var(--opacity);
    clip-path: inset(0 calc(100% - var(--hold-button-progress) * 100%) 0 0);
    transition:
      clip-path 0.1s,
      opacity 0s;

    &.confirmed {
      --opacity: 0.68;
    }
  }

  &.holding:not(.is-disabled) .pxd-hold-button--overlay {
    transition: opacity 0.1s;
  }
}
</style>
