<script lang="ts" setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  shallowRef,
  watch,
} from 'vue'
import {
  getScrollContainer,
  getScrollElByContainer,
  hasScrollbar,
  isScrollable,
} from '../../utils/dom'
import { optimizedOff, optimizedOn, preventDefaultScroll } from '../../utils/event'
import { isTruthyProp } from '../../utils/format'
import { isServer } from '../../utils/is'
import { unrefElement } from '../../utils/ref'
import PTeleport from '../teleport/index.vue'

interface Props {
  blurred?: boolean
  zIndex?: number
  modelValue?: boolean
  transparent?: boolean
  appendToBody?: boolean
  closeOnPressEscape?: boolean
  closeOnClickOverlay?: boolean
  shownElement?: string | HTMLElement
}

defineOptions({
  name: 'POverlay',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  appendToBody: true,
  closeOnPressEscape: true,
})

const emits = defineEmits<{
  'click': [MouseEvent]
  'escape': [KeyboardEvent]
  'update:modelValue': [boolean]
}>()

const SCROLL_LOCK_COUNTS = new WeakMap<HTMLElement, number>()
let documentTouchMoveLocks = 0

let scrollContainer: HTMLElement | null

const clipPath = shallowRef('')
const overlayRef = shallowRef<HTMLElement>()
const computedStyle = computed(() => ({ '--z': props.zIndex, 'clip-path': clipPath.value }))

function onOverlayClick(ev: MouseEvent) {
  emits('click', ev)

  if (!isTruthyProp(props.closeOnClickOverlay)) {
    return
  }

  emits('update:modelValue', false)
}

function onOverlayKeydown(ev: KeyboardEvent) {
  if (!props.modelValue || !isTruthyProp(props.closeOnPressEscape)) {
    return
  }

  if (ev.ctrlKey || ev.metaKey || ev.altKey || ev.shiftKey) {
    return
  }

  if (ev.key !== 'Escape') {
    return
  }

  emits('escape', ev)
  emits('update:modelValue', false)
}

function lockScrollContainer() {
  if (!scrollContainer) {
    return
  }

  const currentLocks = SCROLL_LOCK_COUNTS.get(scrollContainer) ?? 0
  SCROLL_LOCK_COUNTS.set(scrollContainer, currentLocks + 1)

  // Already locked by another overlay instance (same container)
  if (currentLocks > 0) {
    return
  }

  const { x: xScrollbar, y: yScrollbar } = hasScrollbar(scrollContainer)
  const { x: xScrollable, y: yScrollable } = isScrollable(scrollContainer)

  if (xScrollbar && xScrollable) {
    scrollContainer.classList.add('scrollbar-stable', 'scroll-disabled-x')
  }

  if (yScrollbar && yScrollable) {
    scrollContainer.classList.add('scrollbar-stable', 'scroll-disabled-y')
  }

  documentTouchMoveLocks++
  if (documentTouchMoveLocks === 1) {
    optimizedOn(document, 'touchmove', preventDefaultScroll, { passive: false })
  }
}

function unlockScrollContainer() {
  if (!scrollContainer) {
    return
  }

  const currentLocks = SCROLL_LOCK_COUNTS.get(scrollContainer) ?? 0
  if (!currentLocks) {
    return
  }

  const nextLocks = Math.max(currentLocks - 1, 0)
  if (nextLocks) {
    SCROLL_LOCK_COUNTS.set(scrollContainer, nextLocks)
    return
  }

  SCROLL_LOCK_COUNTS.delete(scrollContainer)

  scrollContainer.classList.remove(
    'scrollbar-stable',
    'scroll-disabled-x',
    'scroll-disabled-y',
  )

  documentTouchMoveLocks = Math.max(documentTouchMoveLocks - 1, 0)
  if (!documentTouchMoveLocks) {
    optimizedOff(document, 'touchmove', preventDefaultScroll)
  }
}

function tryGetShownElementIfNeed() {
  const { shownElement } = props

  if (!shownElement) {
    return
  }

  const el = typeof shownElement === 'string'
    ? document.querySelector<HTMLElement>(shownElement)
    : unrefElement(shownElement)

  if (!el) {
    return
  }

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
  if (isServer) {
    return
  }

  if (!visible) {
    unlockScrollContainer()
    optimizedOff(document, 'keydown', onOverlayKeydown)

    return
  }

  nextTick(() => {
    if (!scrollContainer) {
      scrollContainer = getScrollElByContainer(
        getScrollContainer(overlayRef.value!),
      ) as HTMLElement
    }

    lockScrollContainer()
    tryGetShownElementIfNeed()
    optimizedOn(document, 'keydown', onOverlayKeydown)
  })
}

watch(
  () => props.modelValue,
  onOverlayVisibleChange,
  { immediate: true },
)

watch(
  () => props.shownElement,
  tryGetShownElementIfNeed,
)

onBeforeUnmount(() => {
  optimizedOff(document, 'keydown', onOverlayKeydown)

  unlockScrollContainer()
  scrollContainer = null
})
</script>

<template>
  <PTeleport :disabled="!appendToBody">
    <Transition name="pxd-transition--fade" mode="out-in" appear>
      <div
        v-if="modelValue"
        ref="overlayRef"
        :data-blurred="blurred"
        :data-transparent="transparent"
        class="pxd-overlay inset-0 bg-black/40 sm:bg-background-100/80 pointer-events-auto fixed z-(--z,10) motion-safe:transition-colors"
        :style="computedStyle"
        v-bind="$attrs"
        @touchmove.prevent.stop
        @click="onOverlayClick"
      />
    </Transition>

    <slot />
  </PTeleport>
</template>

<style>
.pxd-overlay[data-blurred="true"] {
  backdrop-filter: blur(4px);
}

.pxd-overlay[data-transparent="true"] {
  opacity: 0;
}
</style>
