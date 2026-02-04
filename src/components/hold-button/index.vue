<script lang="ts" setup>
import type { ButtonProps } from '../../types/components/button'
import { computed, onBeforeUnmount, shallowRef } from 'vue'
import { getStyle } from '../../utils/dom'
import { off, once } from '../../utils/event'
import PButton from '../button/index.vue'

interface Props extends Omit<ButtonProps, 'as'> {
  vibrate?: boolean
  scalable?: boolean
  durations?: number | string
  maskColor?: string
  cancelable?: boolean
}

defineOptions({
  name: 'PHoldButton',
})

const props = withDefaults(defineProps<Props>(), {
  vibrate: true,
  scalable: true,
  durations: 2000,
  maskColor: 'var(--color-gray-alpha-600)',
})

const emits = defineEmits<{
  confirm: []
  canceled: []
  finished: [boolean]
  pointerup: [PointerEvent]
  pointerdown: [PointerEvent]
}>()

type Status = 'idle' | 'loading' | 'canceled' | 'confirmed'

const status = shallowRef<Status>('idle')

const computedAttrs = computed(() => {
  const { scalable, durations, maskColor, cancelable, ...rest } = props

  return {
    class: [
      'pxd-hold-button relative motion-safe:transition-all',
      {
        scalable,
        effective: status.value !== 'canceled',
      },
    ],
    ...rest,
  }
})

const computedStyle = computed(() => {
  const { durations, maskColor } = props

  let _durations = Number(durations)
  if (Number.isNaN(_durations) || _durations < 0) {
    console.warn('Invalid durations value provided to PHoldButton, defaulting to 2000')
    _durations = 2000
  }

  return {
    '--hold-button-durations': `${_durations}ms`,
    '--hold-button-mask-color': maskColor,
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
    emits('canceled')
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

  emits('finished', isConfirmed)
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
        class="pxd-hold-button--overlay pointer-events-none absolute -inset-px rounded-inherit bg-(--hold-button-mask-color) default-transition-timing-function!"
        :class="{ finished: status === 'confirmed' }"
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

  &:hover {
    .pxd-hold-button--overlay {
      will-change: clip-path;
    }
  }

  .pxd-hold-button--overlay {
    --opacity: 0.45;
    opacity: var(--opacity);
    clip-path: inset(0 100% 0 0);
    transition:
      clip-path 0.1s,
      opacity 0s;

    &.finished {
      --opacity: 0.68;
    }
  }

  &.effective:not(.is-disabled):active .pxd-hold-button--overlay {
    clip-path: inset(0px);
    transition:
      clip-path var(--hold-button-durations),
      opacity var(--default-transition-duration);
  }
}
</style>
