<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { useMutationObserver, useResizeObserver } from '../../composables/use-browser-observer'
import { getStyle } from '../../utils/dom'
import { cachedOff, cachedOn, off, once } from '../../utils/event'
import { isServer } from '../../utils/is'
import { throttleByRaf } from '../../utils/throttle'
import PFader from '../fader/index.vue'
import type {
  ScrollableCachedPadding,
  ScrollableDragState,
  ScrollableEmits,
  ScrollableProps,
} from './types'

defineOptions({
  name: 'PScrollable',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ScrollableProps>(), {
  fader: true,
  scrollbar: true,
  bottomThreshold: 10,
})

const emits = defineEmits<ScrollableEmits>()

const wrapperRef = shallowRef<HTMLElement>()
const contentRef = shallowRef<HTMLElement>()

// Avoid using ref to guarantee all states to ensure that
// computed will not cause meaningless updates when the state changes.
const isScrollableX = shallowRef(false)
const isScrollableY = shallowRef(false)
const verticalThumbTop = shallowRef(0)
const horizontalThumbLeft = shallowRef(0)
const verticalThumbHeight = shallowRef(0)
const horizontalThumbWidth = shallowRef(0)

const MIN_THUMB = 30

let triggerRightFired = false
let triggerBottomFired = false

let dragState: ScrollableDragState = {
  isDragging: false,
  direction: null,
  startClientPos: 0,
  startThumbPos: 0,
}

let cachedPadding: ScrollableCachedPadding = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
}

const computedStyle = computed(() => {
  return {
    '--scrollbar-size': props.scrollbarSize,
    '--scrollbar-color': props.scrollbarColor,
    '--scrollbar-hover-color': props.scrollbarHoverColor,
  }
})

const verticalThumbStyle = computed(() => ({
  height: `${verticalThumbHeight.value}px`,
  transform: `translateY(${verticalThumbTop.value}px)`,
}))

const horizontalThumbStyle = computed(() => ({
  width: `${horizontalThumbWidth.value}px`,
  transform: `translateX(${horizontalThumbLeft.value}px)`,
}))

function updateScrollbarMetrics() {
  if (!props.scrollbar) {
    return
  }

  const contentEl = contentRef.value

  if (!contentEl || !contentEl.isConnected) {
    return
  }

  const { top: pt, bottom: pb, left: pl, right: pr } = cachedPadding

  const {
    clientWidth: clientW,
    clientHeight: clientH,
    scrollWidth: scrollW,
    scrollHeight: scrollH,
  } = contentEl

  // 轨道尺寸使用外层 wrapper 的 padding-box，确保外层 padding 时计算准确
  const trackW = wrapperRef.value!.clientWidth ?? clientW
  const trackH = wrapperRef.value!.clientHeight ?? clientH

  const effClientW = Math.max(0, clientW - pl - pr)
  const effClientH = Math.max(0, clientH - pt - pb)
  const effScrollW = Math.max(effClientW, scrollW - pl - pr)
  const effScrollH = Math.max(effClientH, scrollH - pt - pb)

  // 可滚动性与比例基于有效尺寸，滑块像素基于轨道尺寸
  const _isScrollableX = effScrollW > effClientW
  const _isScrollableY = effScrollH > effClientH

  const verticalRatio = effScrollH > 0 ? effClientH / effScrollH : 0
  const horizontalRatio = effScrollW > 0 ? effClientW / effScrollW : 0

  const _verticalThumbHeight = Math.max(Math.round(trackH * verticalRatio), MIN_THUMB)
  const _horizontalThumbWidth = Math.max(Math.round(trackW * horizontalRatio), MIN_THUMB)

  const scrollableWidth = Math.max(0, trackW - _horizontalThumbWidth)
  const scrollableHeight = Math.max(0, trackH - _verticalThumbHeight)

  const maxScrollX = Math.max(1, scrollW - clientW)
  const maxScrollY = Math.max(1, scrollH - clientH)

  const verticalScrollPercentage = Math.min(1, Math.max(0, contentEl.scrollTop / maxScrollY))
  const horizontalScrollPercentage = Math.min(1, Math.max(0, contentEl.scrollLeft / maxScrollX))

  const _verticalThumbTop = verticalScrollPercentage * scrollableHeight
  const _horizontalThumbLeft = horizontalScrollPercentage * scrollableWidth

  isScrollableX.value = _isScrollableX
  isScrollableY.value = _isScrollableY
  verticalThumbHeight.value = _verticalThumbHeight
  horizontalThumbWidth.value = _horizontalThumbWidth
  verticalThumbTop.value = _verticalThumbTop
  horizontalThumbLeft.value = _horizontalThumbLeft
}

const throttledUpdate = throttleByRaf(updateScrollbarMetrics)

let lastScrollTop = 0
let lastScrollLeft = 0
let lastScrollInit = false

function onContainerScroll(ev: Event) {
  emits('scroll', ev)

  if (props.scrollbar && !dragState.isDragging) {
    throttledUpdate()
  }

  const el = contentRef.value
  if (!el) {
    return
  }

  if (props.loading) {
    // 加载中仅更新快照，不触发 end
    lastScrollTop = el.scrollTop
    lastScrollLeft = el.scrollLeft
    lastScrollInit = true
    return
  }

  const currTop = el.scrollTop
  const currLeft = el.scrollLeft

  let movedY = false
  let movedX = false

  if (!lastScrollInit) {
    lastScrollTop = currTop
    lastScrollLeft = currLeft
    lastScrollInit = true
  } else {
    movedY = currTop !== lastScrollTop
    movedX = currLeft !== lastScrollLeft
  }

  const threshold = props.bottomThreshold ?? 0

  // 仅在对应方向发生滚动时才进行该方向的 end 判定
  if (movedY) {
    const scrollBottom = Math.floor(currTop + el.clientHeight)

    if (scrollBottom >= el.scrollHeight - threshold) {
      if (!triggerBottomFired) {
        triggerBottomFired = true
        emits('bottom', 'vertical', ev)
      }
    } else {
      triggerBottomFired = false
    }
  } else if (movedX) {
    const scrollRight = Math.floor(currLeft + el.clientWidth)

    if (scrollRight >= el.scrollWidth - threshold) {
      if (!triggerRightFired) {
        triggerRightFired = true
        emits('bottom', 'horizontal', ev)
      }
    } else {
      triggerRightFired = false
    }
  }

  lastScrollTop = currTop
  lastScrollLeft = currLeft
}

function startDragVertical(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()

  if (!contentRef.value) {
    return
  }

  dragState = {
    isDragging: true,
    direction: 'vertical',
    startClientPos: e.clientY,
    startThumbPos: verticalThumbTop.value,
  }

  cachedOn(document, 'mousemove', onDragMove)
  once(document, 'mouseup', onEndDrag)
}

function startDragHorizontal(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()

  if (!contentRef.value) {
    return
  }

  dragState = {
    isDragging: true,
    direction: 'horizontal',
    startClientPos: e.clientX,
    startThumbPos: horizontalThumbLeft.value,
  }

  cachedOn(document, 'mousemove', onDragMove)
  once(document, 'mouseup', onEndDrag)
}

function onDragMove(e: MouseEvent) {
  if (!dragState.isDragging || !dragState.direction) {
    return
  }

  const contentEl = contentRef.value
  if (!contentEl) {
    return
  }

  if (dragState.direction === 'vertical') {
    const trackH = wrapperRef.value!.clientHeight ?? contentEl.clientHeight
    const thumbH = verticalThumbHeight.value
    const scrollableH = Math.max(0, trackH - thumbH)
    const delta = e.clientY - dragState.startClientPos
    const newThumbTop = Math.max(0, Math.min(scrollableH, dragState.startThumbPos + delta))
    const maxScroll = Math.max(0, contentEl.scrollHeight - contentEl.clientHeight)

    contentEl.scrollTop = scrollableH > 0 ? (newThumbTop / scrollableH) * maxScroll : 0
    verticalThumbTop.value = newThumbTop
    return
  }

  const trackW = wrapperRef.value!.clientWidth ?? contentEl.clientWidth
  const thumbW = horizontalThumbWidth.value
  const scrollableW = Math.max(0, trackW - thumbW)
  const delta = e.clientX - dragState.startClientPos
  const newThumbLeft = Math.max(0, Math.min(scrollableW, dragState.startThumbPos + delta))
  const maxScroll = Math.max(0, contentEl.scrollWidth - contentEl.clientWidth)

  contentEl.scrollLeft = scrollableW > 0 ? (newThumbLeft / scrollableW) * maxScroll : 0
  horizontalThumbLeft.value = newThumbLeft
}

function onEndDrag(ev: MouseEvent) {
  ev.stopPropagation()
  dragState.isDragging = false
  dragState.direction = null
  cachedOff(document, 'mousemove', onDragMove)
  throttledUpdate.cancel()
  requestAnimationFrame(updateScrollbarMetrics)
}

function scrollTo(top: number, left: number) {
  if (!contentRef.value) {
    return
  }
  contentRef.value.scrollTo({ top, left })
}

if (props.scrollbar) {
  useResizeObserver(wrapperRef, throttledUpdate)
  useMutationObserver(contentRef, throttledUpdate, { childList: true, subtree: true })
}

function getContainerPadding() {
  const contentEl = contentRef.value

  if (!contentEl) {
    return
  }

  const { paddingTop, paddingRight, paddingBottom, paddingLeft } = getStyle(contentEl)

  cachedPadding = {
    top: Number.parseFloat(paddingTop) || 0,
    bottom: Number.parseFloat(paddingBottom) || 0,
    left: Number.parseFloat(paddingLeft) || 0,
    right: Number.parseFloat(paddingRight) || 0,
  }
}

function forceUpdate() {
  throttledUpdate.cancel()
  getContainerPadding()
  updateScrollbarMetrics()
}

onMounted(async () => {
  if (isServer()) {
    return
  }

  if (!props.scrollbar && !props.fader) {
    return
  }

  getContainerPadding()
  requestAnimationFrame(updateScrollbarMetrics)
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
    ref="wrapperRef"
    class="pxd-scrollable group/scrollable relative flex flex-col overflow-hidden hover:[--o:1] pointer-fine:[--o:0]"
    :class="wrapperClass"
    :style="computedStyle"
    v-bind="$attrs"
  >
    <div
      ref="contentRef"
      :class="contentClass"
      :style="contentStyle"
      class="pxd-scrollable--content relative scrollbar-none h-full max-h-inherit max-w-full flex-1 shrink-0 overflow-scroll intrinsic-size-auto"
      @scroll.passive="onContainerScroll"
    >
      <slot />
    </div>

    <PFader
      v-if="fader"
      :size="faderSize"
      :color="faderColor"
      :container="contentRef"
      :direction="faderDirection"
    />

    <template v-if="scrollbar">
      <div
        v-if="isScrollableX"
        aria-hidden="true"
        class="pxd-scrollable--scrollbar-x left-0 right-0 bottom-0 absolute touch-none opacity-(--o) delay-1000 select-none group-hover/scrollable:delay-0 active:opacity-100 motion-safe:transition-opacity"
      >
        <div
          class="pxd-scrollable--thumb h-inherit rounded-full hover:will-change-transform active:opacity-100 motion-safe:transition-colors"
          :style="horizontalThumbStyle"
          @mousedown="startDragHorizontal"
        />
      </div>

      <div
        v-if="isScrollableY"
        aria-hidden="true"
        class="pxd-scrollable--scrollbar-y top-0 right-0 bottom-0 absolute touch-none opacity-(--o) delay-1000 select-none group-hover/scrollable:delay-0 active:opacity-100 motion-safe:transition-opacity"
      >
        <div
          class="pxd-scrollable--thumb w-inherit rounded-full hover:will-change-transform active:opacity-100 motion-safe:transition-colors"
          :style="verticalThumbStyle"
          @mousedown="startDragVertical"
        />
      </div>
    </template>
  </div>
</template>

<style>
.pxd-scrollable--scrollbar-x {
  height: calc(var(--scrollbar-size, 6) * 1px);
}

.pxd-scrollable--scrollbar-y {
  width: calc(var(--scrollbar-size, 6) * 1px);
}

.pxd-scrollable--thumb {
  background-color: var(--scrollbar-color, var(--color-gray-alpha-300));
}

.pxd-scrollable--thumb:hover,
.pxd-scrollable--thumb:active {
  background-color: var(--scrollbar-hover-color, var(--color-gray-alpha-500));
}
</style>
