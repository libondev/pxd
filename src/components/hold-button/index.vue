<script lang="ts" setup>
import type { HoldButtonEmits, HoldButtonProps } from './types'
import { useAgentNode } from '../../composables/_internal/use-agent-node.js'
import { useHold } from '../../composables/use-hold.js'
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

let activePointerId: number | null = null
// An agent's `hold` waits here for the confirm or the cancel it produces.
let settleHold: (() => void) | undefined

const { status, progress, start, pause, resume, stop } = useHold({
  duration: () => props.duration,
  enabled: () => !props.disabled,
  onConfirm: () => {
    emits('confirm')
    onTriggerVibrate()
    settleHold?.()
  },
  onCancel: (progress) => {
    emits('cancel', progress)
    settleHold?.()
  },
})

useAgentNode({
  name: 'hold-button',
  pressable: () => false,
  state: () => ({
    status: status.value,
    disabled: props.disabled ?? false,
  }),
  actions: {
    hold: () => {
      if (props.disabled || settleHold) {
        return
      }

      return new Promise<void>((resolve) => {
        settleHold = () => {
          settleHold = undefined
          resolve()
        }

        start()
      })
    },
  },
})

function onTriggerVibrate() {
  if (props.vibrate && typeof window.navigator.vibrate === 'function') {
    window.navigator.vibrate(100)
  }
}

function onPointerDown(event: PointerEvent) {
  if (props.disabled || event.button !== 0) {
    return
  }

  const target = event.currentTarget as HTMLElement

  // Capture keeps `pointerup` coming when the pointer is released outside the window.
  target.setPointerCapture(event.pointerId)

  activePointerId = event.pointerId
  start()

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
    resume()

    return
  }

  pause()
}

function onPointerUp(event: PointerEvent) {
  if (event.pointerId !== activePointerId) {
    return
  }

  activePointerId = null
  stop()

  emits('pointerup', event)
}
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
