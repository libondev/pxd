<script lang="ts" setup>
import type { HoldButtonEmits, HoldButtonProps, HoldButtonStatus } from './types'
import { computed, onBeforeUnmount, shallowRef, useAttrs } from 'vue'
import { getStyle } from '../../utils/dom'
import { off, once } from '../../utils/event'
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

const attrs = useAttrs()

const status = shallowRef<HoldButtonStatus>('idle')

const computedAttrs = computed(() => {
  return {
    class: [
      'pxd-hold-button relative motion-safe:transition-appearance',
      {
        scalable: props.scalable,
        effective: status.value !== 'canceled',
      },
    ],
    ...attrs,
  }
})

const computedStyle = computed(() => {
  const { durations, progressColor } = props

  let _durations = Number(durations)
  if (Number.isNaN(_durations) || _durations < 0) {
    _durations = 2000
  }

  return {
    '--hold-button-durations': `${_durations}ms`,
    '--hold-button-progress-color': progressColor,
  }
})

function onTriggerVibrate() {
  if (!props.vibrate) {
    return
  }

  if (typeof window.navigator.vibrate !== 'function') {
    return
  }

  window.navigator.vibrate(100)
}

function onPointerEnter(e: PointerEvent) {
  if (props.disabled) {
    return
  }

  if (!checkIsHolding(e)) {
    status.value = 'idle'
    return
  }

  if (status.value === 'canceled') {
    status.value = 'loading'
  }
}

function onPointerLeave(e: PointerEvent) {
  if (props.disabled || !checkIsHolding(e) || !props.cancelable) {
    return
  }

  if (status.value === 'loading' || status.value === 'confirmed') {
    status.value = 'canceled'
    emits('cancel')
  }
}

function onPointerDown(event: PointerEvent) {
  if (props.disabled) {
    return
  }

  status.value = 'loading'

  emits('pointerdown', event)

  once(document, 'pointerup', onPointerUp)
  once(document, 'pointercancel', onPointerUp)
}

function onPointerUp(event: PointerEvent) {
  if (props.disabled) {
    return
  }

  const isConfirmed = status.value === 'confirmed'

  status.value = 'idle'

  emits('release', isConfirmed)
  emits('pointerup', event)

  onTriggerVibrate()

  cleanPointerReleaseEvents()
}

function onTransitionEnd({ target, propertyName }: TransitionEvent) {
  if (status.value !== 'loading') {
    return
  }

  const stylesValue = getStyle(target as HTMLElement).getPropertyValue(propertyName)
  const isConfirmed = stylesValue === 'inset(0px)'

  if (isConfirmed) {
    emits('confirm')
    status.value = 'confirmed'
    return
  }

  status.value = 'loading'
}

function cleanPointerReleaseEvents() {
  off(document, 'pointerup', onPointerUp)
  off(document, 'pointercancel', onPointerUp)
}

function checkIsHolding(e: PointerEvent) {
  return e.buttons === 1
}

onBeforeUnmount(() => {
  cleanPointerReleaseEvents()
})
</script>

<template>
  <PButton
    v-bind="computedAttrs"
    @pointerdown="onPointerDown"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
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
        :style="computedStyle"
        @transitionend="onTransitionEnd"
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
    clip-path: inset(0 100% 0 0);
    transition:
      clip-path 0.1s,
      opacity 0s;

    &.confirmed {
      --opacity: 0.68;
    }
  }

  &.effective:not(.is-disabled):active .pxd-hold-button--overlay {
    clip-path: inset(0px);
    transition:
      clip-path var(--hold-button-durations),
      opacity 0.1s;
  }
}
</style>
