<script lang="ts" setup>
import type { ButtonProps } from '../../types/components/button'
import { computed, onBeforeUnmount, shallowRef } from 'vue'
import { off, once } from '../../utils/events'
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

const props = withDefaults(
  defineProps<Props>(),
  {
    vibrate: true,
    scalable: true,
    durations: 2,
    maskColor: 'var(--color-gray-alpha-600)',
  },
)

const emits = defineEmits<{
  confirm: []
  canceled: []
  finished: [boolean]
  pointerup: [PointerEvent]
  pointerdown: [PointerEvent]
}>()

type Status = 'idle' | 'loading' | 'canceled' | 'confirmed'

let isStarted = false
const status = shallowRef<Status>('idle')

const computedAttrs = computed(() => {
  const { scalable, durations, maskColor, cancelable, ...rest } = props

  return {
    class: ['pxd-hold-button relative motion-safe:transition-all', {
      scalable,
      effective: status.value !== 'canceled',
    }],
    ...rest,
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

function onPointerEnter() {
  if (props.disabled) {
    return
  }

  if (!isStarted) {
    status.value = 'idle'
    return
  }

  if (status.value === 'canceled') {
    isStarted = true
    status.value = 'loading'
  }
}

function onPointerLeave() {
  if (
    props.disabled
    || !isStarted
    || !props.cancelable
  ) {
    return
  }

  status.value = 'canceled'
  emits('canceled')
}

function onPointerDown(event: PointerEvent) {
  if (props.disabled) {
    return
  }

  isStarted = true
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

  isStarted = false
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

  const stylesValue = getComputedStyle(target as HTMLElement).getPropertyValue(propertyName)
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
        class="pxd-hold-button--overlay absolute -inset-px bg-(--mc) rounded-inherit pointer-events-none"
        :class="{ finished: status === 'confirmed' }"
        :style="`--ds:${durations}s;--mc:${maskColor}`"
        @transitionend="onTransitionEnd"
      />
    </template>
  </PButton>
</template>

<style lang="postcss">
.pxd-hold-button {
  &.scalable:not(.is-disabled):active {
    transform: scale(.97);
  }

  &:hover {
    .pxd-hold-button--overlay {
      will-change: clip-path;
    }
  }

  .pxd-hold-button--overlay {
    --opacity: .45;
    opacity: var(--opacity);
    clip-path: inset(0 100% 0 0);
    transition: clip-path .1s ease-out, opacity 0s linear;

    &.finished {
      --opacity: .68;
    }
  }

  &.effective:not(.is-disabled):active .pxd-hold-button--overlay {
    clip-path: inset(0px);
    transition: clip-path var(--ds) ease-out, opacity var(--default-transition-duration) var(--default-transition-timing-function);
  }
}
</style>
