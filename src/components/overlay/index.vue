<script lang="ts" setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  shallowRef,
  watch,
} from 'vue'
import { useLockScroll } from '../../composables'
import {
  getScrollContainer,
  getScrollElByContainer,
  hasScrollbar,
  isScrollable,
} from '../../utils/dom'
import { cachedOff, cachedOn } from '../../utils/event'
import { isTruthyProp } from '../../utils/format'
import { isServer } from '../../utils/is'
import { unrefElement } from '../../utils/ref'
import PTeleport from '../teleport/index.vue'
import { isTopOverlay, pushOverlay, removeOverlay } from './overlay-stack'

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

const {
  isLocked,
  lockScroll,
  unlockScroll,
} = useLockScroll()

const overlayId = Symbol('pxd-overlay')

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

  if (!isTopOverlay(overlayId)) {
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

  if (!isLocked(scrollContainer)) {
    const { x: xScrollbar, y: yScrollbar } = hasScrollbar(scrollContainer)
    const { x: xScrollable, y: yScrollable } = isScrollable(scrollContainer)

    if (xScrollbar && xScrollable) {
      scrollContainer.classList.add('scrollbar-stable', 'scroll-disabled-x')
    }

    if (yScrollbar && yScrollable) {
      scrollContainer.classList.add('scrollbar-stable', 'scroll-disabled-y')
    }
  }

  lockScroll(scrollContainer)
}

function unlockScrollContainer() {
  if (!scrollContainer) {
    return
  }

  unlockScroll(scrollContainer)

  if (!isLocked(scrollContainer)) {
    scrollContainer.classList.remove(
      'scrollbar-stable',
      'scroll-disabled-x',
      'scroll-disabled-y',
    )
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
    removeOverlay(overlayId)
    unlockScrollContainer()
    cachedOff(document, 'keydown', onOverlayKeydown)

    return
  }

  pushOverlay(overlayId)
  nextTick(() => {
    if (!scrollContainer) {
      scrollContainer = getScrollElByContainer(
        getScrollContainer(overlayRef.value!),
      ) as HTMLElement
    }

    lockScrollContainer()
    tryGetShownElementIfNeed()
    cachedOn(document, 'keydown', onOverlayKeydown)
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
  cachedOff(document, 'keydown', onOverlayKeydown)

  removeOverlay(overlayId)
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
