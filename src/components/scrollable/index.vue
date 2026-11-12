<script lang="ts" setup>
import type { ComponentDirection } from '../../types/shared/props'
import type { ScrollableEmits, ScrollableProps } from './types'
import { computed, onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { useMutationObserver } from '../../composables/use-mutation-observer.js'
import { useResizeObserver } from '../../composables/use-resize-observer.js'
import { getStyle } from '../../utils/dom.js'
import { cachedOff, cachedOn, off, on, raf, throttleByRaf } from '../../utils/event.js'
import PFader from '../fader/index.vue'

interface DragState {
  direction: ComponentDirection
  startClientPos: number
  startThumbPos: number
}

interface ScrollPos {
  top: number
  left: number
}

defineOptions({
  name: 'PScrollable',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ScrollableProps>(), {
  fader: true,
  scrollbar: true,
  bottomThreshold: 16,
})

const emits = defineEmits<ScrollableEmits>()

const MIN_THUMB = 30
const reachedEnd: Record<ComponentDirection, boolean> = { horizontal: false, vertical: false }

let drag: DragState | null = null
let lastScrollPos: ScrollPos | null = null
const throttledUpdate = throttleByRaf(updateScrollbarMetrics)

const wrapperRef = shallowRef<HTMLElement>()
const contentRef = shallowRef<HTMLElement>()

// Equal shallowRef writes do not wake the render effect on every measurement frame.
const isScrollableX = shallowRef(false)
const isScrollableY = shallowRef(false)
const verticalThumbTop = shallowRef(0)
const horizontalThumbLeft = shallowRef(0)
const verticalThumbHeight = shallowRef(0)
const horizontalThumbWidth = shallowRef(0)
const observedContent = shallowRef<HTMLElement[]>([])

const computedStyle = computed(() => ({
  '--scrollbar-size': props.scrollbarSize,
  '--scrollbar-color': props.scrollbarColor,
  '--scrollbar-hover-color': props.scrollbarHoverColor,
}))

const verticalThumbStyle = computed(() => ({
  height: `${verticalThumbHeight.value}px`,
  transform: `translateY(${verticalThumbTop.value}px)`,
}))

const horizontalThumbStyle = computed(() => ({
  width: `${horizontalThumbWidth.value}px`,
  transform: `translateX(${horizontalThumbLeft.value}px)`,
}))

useResizeObserver(
  () => (props.scrollbar ? [wrapperRef.value, contentRef.value, ...observedContent.value] : []),
  throttledUpdate,
)

useMutationObserver(
  () => (props.scrollbar ? contentRef.value : undefined),
  (items) => {
    if (items.some((item) => item.entry.type === 'childList')) {
      syncObservedContent()
    }

    throttledUpdate()
  },
  { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] },
)

function readPadding(el: HTMLElement) {
  const { paddingTop, paddingRight, paddingBottom, paddingLeft } = getStyle(el)

  return {
    x: (Number.parseFloat(paddingLeft) || 0) + (Number.parseFloat(paddingRight) || 0),
    y: (Number.parseFloat(paddingTop) || 0) + (Number.parseFloat(paddingBottom) || 0),
  }
}

function updateScrollbarMetrics() {
  if (!props.scrollbar) {
    return
  }

  const contentEl = contentRef.value

  if (!contentEl || !contentEl.isConnected) {
    return
  }

  const padding = readPadding(contentEl)
  const { clientWidth, clientHeight, scrollWidth, scrollHeight, scrollTop, scrollLeft } = contentEl

  // Track pixels come from the wrapper, ratios from the padding-adjusted content.
  const trackW = wrapperRef.value!.clientWidth
  const trackH = wrapperRef.value!.clientHeight

  const effClientW = Math.max(0, clientWidth - padding.x)
  const effClientH = Math.max(0, clientHeight - padding.y)
  const effScrollW = Math.max(effClientW, scrollWidth - padding.x)
  const effScrollH = Math.max(effClientH, scrollHeight - padding.y)

  isScrollableX.value = effScrollW > effClientW
  isScrollableY.value = effScrollH > effClientH

  const verticalRatio = effScrollH > 0 ? effClientH / effScrollH : 0
  const horizontalRatio = effScrollW > 0 ? effClientW / effScrollW : 0

  verticalThumbHeight.value = Math.max(Math.round(trackH * verticalRatio), MIN_THUMB)
  horizontalThumbWidth.value = Math.max(Math.round(trackW * horizontalRatio), MIN_THUMB)

  const scrollableHeight = Math.max(0, trackH - verticalThumbHeight.value)
  const scrollableWidth = Math.max(0, trackW - horizontalThumbWidth.value)
  const maxScrollX = Math.max(1, scrollWidth - clientWidth)
  const maxScrollY = Math.max(1, scrollHeight - clientHeight)

  verticalThumbTop.value = Math.min(1, Math.max(0, scrollTop / maxScrollY)) * scrollableHeight
  horizontalThumbLeft.value = Math.min(1, Math.max(0, scrollLeft / maxScrollX)) * scrollableWidth
}

function checkEnd(
  direction: ComponentDirection,
  curr: number,
  prev: number,
  clientSize: number,
  scrollSize: number,
  ev: Event,
) {
  if (curr === prev) {
    return
  }

  const atEnd = Math.floor(curr + clientSize) >= scrollSize - props.bottomThreshold

  if (atEnd && !reachedEnd[direction]) {
    reachedEnd[direction] = true
    emits('bottom', direction, ev)
    return
  }

  if (!atEnd) {
    reachedEnd[direction] = false
  }
}

function onContainerScroll(ev: Event) {
  emits('scroll', ev)

  if (props.scrollbar && !drag) {
    throttledUpdate()
  }

  const el = contentRef.value
  if (!el) {
    return
  }

  const pos: ScrollPos = { top: el.scrollTop, left: el.scrollLeft }
  const prev = lastScrollPos
  lastScrollPos = pos

  if (props.loading || !prev) {
    return
  }

  checkEnd('vertical', pos.top, prev.top, el.clientHeight, el.scrollHeight, ev)
  checkEnd('horizontal', pos.left, prev.left, el.clientWidth, el.scrollWidth, ev)
}

function startDrag(direction: ComponentDirection, clientPos: number, thumbPos: number) {
  drag = { direction, startClientPos: clientPos, startThumbPos: thumbPos }
  cachedOn(document, 'mousemove', onDragMove)
  on(document, 'mouseup', onEndDrag)
}

function onDragMove(e: MouseEvent) {
  if (!drag) {
    return
  }

  const contentEl = contentRef.value
  if (!contentEl) {
    return
  }

  const isVertical = drag.direction === 'vertical'
  const trackSize = isVertical ? wrapperRef.value!.clientHeight : wrapperRef.value!.clientWidth
  const thumbSize = isVertical ? verticalThumbHeight.value : horizontalThumbWidth.value
  const scrollable = Math.max(0, trackSize - thumbSize)
  const clientSize = isVertical ? contentEl.clientHeight : contentEl.clientWidth
  const scrollSize = isVertical ? contentEl.scrollHeight : contentEl.scrollWidth
  const delta = (isVertical ? e.clientY : e.clientX) - drag.startClientPos
  const thumbPos = Math.max(0, Math.min(scrollable, drag.startThumbPos + delta))
  const offset = scrollable > 0 ? (thumbPos / scrollable) * Math.max(0, scrollSize - clientSize) : 0

  if (isVertical) {
    contentEl.scrollTop = offset
    verticalThumbTop.value = thumbPos
    return
  }

  contentEl.scrollLeft = offset
  horizontalThumbLeft.value = thumbPos
}

function onEndDrag(ev: MouseEvent) {
  ev.stopPropagation()
  drag = null
  cachedOff(document, 'mousemove', onDragMove)
  off(document, 'mouseup', onEndDrag)
  throttledUpdate.cancel()
  raf(updateScrollbarMetrics)
}

function scrollTo(top: number, left: number) {
  if (!contentRef.value) {
    return
  }
  contentRef.value.scrollTo({ top, left, behavior: 'instant' })
}

function syncObservedContent() {
  const contentEl = contentRef.value
  observedContent.value = contentEl ? (Array.from(contentEl.children) as HTMLElement[]) : []
}

function forceUpdate() {
  throttledUpdate.cancel()
  syncObservedContent()
  updateScrollbarMetrics()
}

onMounted(() => {
  syncObservedContent()
  raf(updateScrollbarMetrics)
})

onBeforeUnmount(() => {
  throttledUpdate.cancel()

  cachedOff(document, 'mousemove', onDragMove)
  off(document, 'mouseup', onEndDrag)
})

defineExpose({
  scrollTo,
  forceUpdate,
})
</script>

<template>
  <div
    data-scrollable
    ref="wrapperRef"
    class="pxd-scrollable group/scrollable relative flex flex-col overflow-hidden hover:[--o:1] pointer-fine:[--o:0]"
    :class="wrapperClass"
    :style="computedStyle"
    v-bind="$attrs"
  >
    <div
      ref="contentRef"
      :class="contentClass"
      class="pxd-scrollable--content relative scrollbar-none h-full max-h-inherit max-w-full flex-1 shrink-0 overflow-scroll intrinsic-size-auto"
      @scroll.passive="onContainerScroll"
    >
      <slot />
    </div>

    <PFader
      v-if="fader"
      :size="faderSize"
      :color="faderColor"
      :scroll-target="contentRef"
      :direction="faderDirection"
    />

    <template v-if="scrollbar">
      <div
        aria-hidden="true"
        class="pxd-scrollable--scrollbar-x left-0 right-0 bottom-0 absolute touch-none opacity-(--o) delay-1000 select-none group-hover/scrollable:delay-0 active:opacity-100 motion-safe:transition-opacity"
        :class="{ 'pointer-events-none opacity-0!': !isScrollableX }"
      >
        <div
          class="pxd-scrollable--thumb h-inherit rounded-full group-hover/scrollable:will-change-transform active:opacity-100 motion-safe:transition-colors"
          :style="horizontalThumbStyle"
          @mousedown.prevent.stop="startDrag('horizontal', $event.clientX, horizontalThumbLeft)"
        />
      </div>

      <div
        aria-hidden="true"
        class="pxd-scrollable--scrollbar-y top-0 right-0 bottom-0 absolute touch-none opacity-(--o) delay-1000 select-none group-hover/scrollable:delay-0 active:opacity-100 motion-safe:transition-opacity"
        :class="{ 'pointer-events-none opacity-0!': !isScrollableY }"
      >
        <div
          class="pxd-scrollable--thumb w-inherit rounded-full group-hover/scrollable:will-change-transform active:opacity-100 motion-safe:transition-colors"
          :style="verticalThumbStyle"
          @mousedown.prevent.stop="startDrag('vertical', $event.clientY, verticalThumbTop)"
        />
      </div>
    </template>
  </div>
</template>

<style>
.pxd-scrollable--scrollbar-x {
  height: calc(var(--scrollbar-size, 6) * 0.0625rem);
}

.pxd-scrollable--scrollbar-y {
  width: calc(var(--scrollbar-size, 6) * 0.0625rem);
}

.pxd-scrollable--thumb {
  background-color: var(--scrollbar-color, var(--color-gray-alpha-300));
}

.pxd-scrollable--thumb:hover,
.pxd-scrollable--thumb:active {
  background-color: var(--scrollbar-hover-color, var(--color-gray-alpha-500));
}
</style>
