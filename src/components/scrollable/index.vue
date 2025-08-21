<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { ComponentClass, ComponentDirection, Nullable } from '../../types/shared'
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { useResizeObserver } from '../../composables/use-browser-observer'
import { off, on, once } from '../../utils/events'
import { isServer } from '../../utils/is'
import { throttleByRaf } from '../../utils/throttle'
import PFader from '../fader/index.vue'

interface Props {
  fader?: boolean
  faderSize?: number
  faderColor?: string
  faderDirection?: ComponentDirection | 'both'
  scrollbar?: boolean
  wrapperClass?: ComponentClass
  contentClass?: ComponentClass
  contentStyle?: CSSProperties | string
  scrollbarSize?: number
  scrollbarColor?: string
  scrollbarHoverColor?: string
}

defineOptions({
  name: 'PScrollable',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    fader: true,
    faderSize: 16,
    scrollbar: true,
    scrollbarSize: 6,
    scrollbarColor: 'var(--color-gray-alpha-300)',
    scrollbarHoverColor: 'var(--color-gray-alpha-500)',
  },
)

const emits = defineEmits<{
  scroll: [Event]
}>()

const wrapperRef = shallowRef<HTMLElement>()
const contentRef = shallowRef<HTMLElement>()

const MIN_THUMB = 30

let dragState: {
  isDragging: boolean
  direction: Nullable<ComponentDirection>
  startClientPos: number
  startThumbPos: number
} = {
  isDragging: false,
  direction: null,
  startClientPos: 0,
  startThumbPos: 0,
}

const scrollInfo = ref({
  isScrollableX: false,
  isScrollableY: false,
  verticalThumbHeight: 0,
  horizontalThumbWidth: 0,
  verticalThumbTop: 0,
  horizontalThumbLeft: 0,
})

const computedStyle = computed(() => {
  return {
    '--scrollbar-size': `${props.scrollbarSize}px`,
    '--scrollbar-color': props.scrollbarColor,
    '--scrollbar-hover-color': props.scrollbarHoverColor,
  }
})

const verticalThumbStyle = computed(() => ({
  height: `${scrollInfo.value.verticalThumbHeight}px`,
  transform: `translateY(${scrollInfo.value.verticalThumbTop}px)`,
}))

const horizontalThumbStyle = computed(() => ({
  width: `${scrollInfo.value.horizontalThumbWidth}px`,
  transform: `translateX(${scrollInfo.value.horizontalThumbLeft}px)`,
}))

function updateScrollbarMetrics() {
  const contentEl = contentRef.value
  if (!contentEl || !props.scrollbar) {
    return
  }

  const cs = getComputedStyle(contentEl)
  const pt = Number.parseFloat(cs.paddingTop) || 0
  const pb = Number.parseFloat(cs.paddingBottom) || 0
  const pl = Number.parseFloat(cs.paddingLeft) || 0
  const pr = Number.parseFloat(cs.paddingRight) || 0

  const {
    clientWidth: clientW,
    clientHeight: clientH,
    scrollWidth: scrollW,
    scrollHeight: scrollH,
  } = contentEl

  // 轨道尺寸使用外层 wrapper 的 padding-box，确保外层 padding 时计算准确
  const trackW = wrapperRef.value?.clientWidth ?? clientW
  const trackH = wrapperRef.value?.clientHeight ?? clientH

  const effClientW = Math.max(0, clientW - pl - pr)
  const effClientH = Math.max(0, clientH - pt - pb)
  const effScrollW = Math.max(effClientW, scrollW - pl - pr)
  const effScrollH = Math.max(effClientH, scrollH - pt - pb)

  // 可滚动性与比例基于有效尺寸，滑块像素基于轨道尺寸
  const isScrollableX = effScrollW > effClientW
  const isScrollableY = effScrollH > effClientH

  const verticalRatio = effScrollH > 0 ? (effClientH / effScrollH) : 0
  const horizontalRatio = effScrollW > 0 ? (effClientW / effScrollW) : 0

  const verticalThumbHeight = Math.max(Math.round(trackH * verticalRatio), MIN_THUMB)
  const horizontalThumbWidth = Math.max(Math.round(trackW * horizontalRatio), MIN_THUMB)

  const scrollableWidth = Math.max(0, trackW - horizontalThumbWidth)
  const scrollableHeight = Math.max(0, trackH - verticalThumbHeight)

  const maxScrollX = Math.max(1, scrollW - clientW)
  const maxScrollY = Math.max(1, scrollH - clientH)

  const verticalScrollPercentage = Math.min(1, Math.max(0, contentEl.scrollTop / maxScrollY))
  const horizontalScrollPercentage = Math.min(1, Math.max(0, contentEl.scrollLeft / maxScrollX))

  const verticalThumbTop = verticalScrollPercentage * scrollableHeight
  const horizontalThumbLeft = horizontalScrollPercentage * scrollableWidth

  scrollInfo.value = {
    isScrollableX,
    isScrollableY,
    verticalThumbHeight,
    horizontalThumbWidth,
    verticalThumbTop,
    horizontalThumbLeft,
  }
}

const throttledUpdate = throttleByRaf(updateScrollbarMetrics)

function onContainerScroll(ev: Event) {
  emits('scroll', ev)
  if (props.scrollbar && !dragState.isDragging) {
    throttledUpdate()
  }
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
    startThumbPos: scrollInfo.value.verticalThumbTop,
  }

  on(document, 'mousemove', onDragMove)
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
    startThumbPos: scrollInfo.value.horizontalThumbLeft,
  }

  on(document, 'mousemove', onDragMove)
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
    const trackH = wrapperRef.value?.clientHeight ?? contentEl.clientHeight
    const thumbH = scrollInfo.value.verticalThumbHeight
    const scrollableH = Math.max(0, trackH - thumbH)
    const delta = e.clientY - dragState.startClientPos
    const newThumbTop = Math.max(0, Math.min(scrollableH, dragState.startThumbPos + delta))
    const maxScroll = Math.max(0, contentEl.scrollHeight - contentEl.clientHeight)
    contentEl.scrollTop = scrollableH > 0 ? (newThumbTop / scrollableH) * maxScroll : 0
    scrollInfo.value.verticalThumbTop = newThumbTop
    return
  }

  const trackW = wrapperRef.value?.clientWidth ?? contentEl.clientWidth
  const thumbW = scrollInfo.value.horizontalThumbWidth
  const scrollableW = Math.max(0, trackW - thumbW)
  const delta = e.clientX - dragState.startClientPos
  const newThumbLeft = Math.max(0, Math.min(scrollableW, dragState.startThumbPos + delta))
  const maxScroll = Math.max(0, contentEl.scrollWidth - contentEl.clientWidth)
  contentEl.scrollLeft = scrollableW > 0 ? (newThumbLeft / scrollableW) * maxScroll : 0
  scrollInfo.value.horizontalThumbLeft = newThumbLeft
}

function onEndDrag(ev: MouseEvent) {
  ev.stopPropagation()
  dragState.isDragging = false
  dragState.direction = null
  off(document, 'mousemove', onDragMove)
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
  useResizeObserver(contentRef, throttledUpdate)
  useResizeObserver(wrapperRef, throttledUpdate)
}

onMounted(async () => {
  if (isServer) {
    return
  }
  if (!props.scrollbar && !props.fader) {
    return
  }

  on(window, 'resize', updateScrollbarMetrics, { passive: true })
  requestAnimationFrame(updateScrollbarMetrics)
})

onBeforeUnmount(() => {
  off(window, 'resize', updateScrollbarMetrics)
  off(document, 'mousemove', onDragMove)
  off(document, 'mouseup', onEndDrag)
  throttledUpdate.cancel()
})

defineExpose({
  scrollTo,
  forceUpdate: throttledUpdate,
})
</script>

<template>
  <div
    ref="wrapperRef"
    class="pxd-scrollable group/scrollable sm:[--o:0] relative flex overflow-hidden hover:[--o:1]"
    :class="wrapperClass"
    :style="computedStyle"
  >
    <div
      ref="contentRef"
      :class="contentClass"
      :style="contentStyle"
      class="pxd-scrollable--content relative scrollbar-hidden max-h-full flex-1 overflow-scroll"
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
        v-if="scrollInfo.isScrollableY"
        aria-hidden="true"
        class="pxd-scrollable--scrollbar-y top-0 right-0 bottom-0 px-0.5 absolute touch-none opacity-(--o) select-none active:opacity-100 motion-safe:transition-opacity"
        style="width:calc(var(--scrollbar-size) + 4px)"
      >
        <div
          class="pxd-scrollable--thumb absolute w-(--scrollbar-size) rounded-full bg-(--scrollbar-color) hover:bg-(--scrollbar-hover-color) hover:will-change-transform active:bg-(--scrollbar-hover-color) active:opacity-100 motion-safe:transition-colors"
          :style="verticalThumbStyle"
          @mousedown="startDragVertical"
        />
      </div>

      <div
        v-if="scrollInfo.isScrollableX"
        aria-hidden="true"
        class="pxd-scrollable--scrollbar-x left-0 right-0 bottom-0 py-0.5 absolute touch-none opacity-(--o) select-none active:opacity-100 motion-safe:transition-opacity"
        style="height:calc(var(--scrollbar-size) + 4px)"
      >
        <div
          class="pxd-scrollable--thumb absolute h-(--scrollbar-size) rounded-full bg-(--scrollbar-color) hover:bg-(--scrollbar-hover-color) hover:will-change-transform active:bg-(--scrollbar-hover-color) active:opacity-100 motion-safe:transition-colors"
          :style="horizontalThumbStyle"
          @mousedown="startDragHorizontal"
        />
      </div>
    </template>
  </div>
</template>
