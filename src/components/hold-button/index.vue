<script lang="ts" setup>
import type { ButtonProps } from '../../types/components'
import { computed, shallowRef } from 'vue'
import Button from '../button/index.vue'

interface Props extends Omit<ButtonProps, 'as'> {
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
    scalable: true,
    durations: 2,
    maskColor: 'var(--gray-alpha-600)',
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
  document.addEventListener('pointerup', onPointerUp, { once: true })
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
</script>

<template>
  <Button
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
  </Button>
</template>

<style lang="postcss">
.pxd-hold-button {
  &.scalable:not(.is-disabled):active {
    transform: scale(.97);
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
    transition: clip-path var(--ds) ease-out, opacity .2s ease-out;
  }
}
</style>
