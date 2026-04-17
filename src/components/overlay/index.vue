<script lang="ts" setup>
import type { MaybeElementRef } from '../../types/shared/utils'
import type { OverlayEmits, OverlayProps } from './types'
import { computed, nextTick, onBeforeUnmount, shallowRef, watch } from 'vue'
import { useLockScroll } from '../../composables/use-lock-scroll'
import { useOverlayManager } from '../../composables/use-overlay-manager'
import { NOOP } from '../../utils/event'
import { isTruthyProp } from '../../utils/format'
import { isServer } from '../../utils/is'
import { unrefElement } from '../../utils/ref'
import PTeleport from '../teleport/index.vue'

defineOptions({
  name: 'POverlay',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<OverlayProps>(), {
  modelValue: false,
  appendToBody: true,
  closeOnPressEscape: true,
})

const emits = defineEmits<OverlayEmits>()

const { lockScroll, unlockScroll } = useLockScroll()

const clipPath = shallowRef('')
const computedStyle = computed(() => ({
  '--overlay-z-index': props.zIndex,
  'clip-path': clipPath.value,
}))

let shownElementEl: HTMLElement | null = null

function onOverlayClick(ev: PointerEvent) {
  dispatchClickOutside(ev)
}

function onOverlayPointerdown(ev: PointerEvent) {
  dispatchPointerDownOutside(ev)
}

const { dispatchClickOutside, dispatchPointerDownOutside } = useOverlayManager(
  computed(() => ({
    enabled: props.modelValue,
    closeOnPressEscape: isTruthyProp(props.closeOnPressEscape),
    closeOnClickOutside: isTruthyProp(props.closeOnClickOverlay),
    onPressEscape: (ev: KeyboardEvent) => {
      emits('escape', ev)
    },
    onClickOutside: (ev: PointerEvent) => {
      emits('click', ev)
    },
    onClose: (reason) => {
      if (reason === 'press-escape' || reason === 'click-outside') {
        emits('update:modelValue', false)
      }
    },
  })),
)

function tryGetShownElementIfNeed() {
  const { shownElement } = props

  if (!shownElement) {
    return
  }

  const el =
    typeof shownElement === 'string'
      ? document.querySelector<HTMLElement>(shownElement)
      : unrefElement(shownElement as MaybeElementRef<HTMLElement>)

  if (!el) {
    return
  }

  shownElementEl = el

  const { top, left, right, bottom } = el.getBoundingClientRect()

  clipPath.value = `polygon(
    0% 0%,
    0% 100%,
    ${left}px 100%,
    ${left}px ${top}px,
    ${right}px ${top}px,
    ${right}px ${bottom}px,
    ${left}px ${bottom}px,
    ${left}px 100%,
    100% 100%,
    100% 0%
  )`
}

function onOverlayVisibleChange(visible: boolean) {
  if (isServer()) {
    return
  }

  if (visible) {
    nextTick(() => {
      lockScroll()
      tryGetShownElementIfNeed()
      shownElementEl?.classList.add('pointer-events-auto')
    })

    return
  }

  unlockScroll()
  shownElementEl?.classList.remove('pointer-events-auto')
}

watch(() => props.modelValue, onOverlayVisibleChange, { immediate: true })

watch(() => props.shownElement, tryGetShownElementIfNeed)

onBeforeUnmount(() => {
  shownElementEl?.classList.remove('pointer-events-auto')
  unlockScroll()
})
</script>

<template>
  <PTeleport :disabled="!appendToBody">
    <Transition name="pxd-transition--fade" mode="out-in" appear>
      <div
        v-if="modelValue"
        :data-blurred="blurred"
        :data-transparent="transparent"
        class="pxd-overlay inset-0 bg-black/40 sm:bg-background-100/80 pointer-events-auto fixed motion-safe:transition-colors"
        :style="computedStyle"
        v-bind="$attrs"
        @touchmove.prevent.stop="NOOP"
        @pointerdown="onOverlayPointerdown"
        @click="onOverlayClick"
      />
    </Transition>

    <slot />
  </PTeleport>
</template>

<style>
.pxd-overlay {
  z-index: var(--overlay-z-index, 10);
}

.pxd-overlay[data-blurred='true'] {
  backdrop-filter: blur(4px);
}

.pxd-overlay[data-transparent='true'] {
  opacity: 0;
}
</style>
