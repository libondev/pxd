<script lang="ts" setup>
import { shallowRef } from 'vue'
import Button from '../button/index.vue'

interface Props {
  scale?: boolean
  durations?: number | string
  maskColor?: string
}

withDefaults(
  defineProps<Props>(),
  {
    scale: true,
    durations: 2,
    maskColor: 'hsl(var(--red-600-value))',
  },
)

const emits = defineEmits<{
  trigger: []
  confirm: [v: boolean]
}>()

let isPointerDown = true
const isConfirm = shallowRef(false)

function onPointerDown() {
  isPointerDown = true
  isConfirm.value = false
}

function onTransitionEnd(ev: TransitionEvent) {
  const targetElement = ev.target as HTMLElement
  const styleValue = getComputedStyle(targetElement).getPropertyValue(ev.propertyName)

  if (isPointerDown && styleValue === 'inset(0px)') {
    emits('trigger')
    isPointerDown = false
    isConfirm.value = true
  }
}

function onPointerUp() {
  emits('confirm', isConfirm.value)
  isPointerDown = false
  isConfirm.value = false
}
</script>

<template>
  <Button class="pxd-hold-button relative !transition-all" :class="{ scale }" @pointerdown="onPointerDown" @pointerup="onPointerUp">
    <template #prefix>
      <slot name="prefix" />
    </template>

    <slot />

    <template #suffix>
      <slot name="suffix" />
      <div
        class="pxd-hold-button--overlay absolute -inset-px bg-(--mc) rounded-[inherit] pointer-events-none"
        :class="{ confirm: isConfirm }"
        :style="`--ds:${durations}s;--mc:${maskColor}`"
        @transitionend="onTransitionEnd"
      />
    </template>
  </Button>
</template>

<style lang="postcss">
.pxd-hold-button--overlay {
  --opacity: .48;
  opacity: var(--opacity);
  clip-path: inset(0 100% 0 0);
  transition: clip-path .1s ease-out, opacity 0s linear;

  &.confirm {
    --opacity: .72;
  }
}

.pxd-hold-button.scale:active {
  transform: scale(.97);
}

.pxd-hold-button:active .pxd-hold-button--overlay {
  clip-path: inset(0);
  transition: clip-path var(--ds) ease-out, opacity .2s ease-out;
}
</style>
