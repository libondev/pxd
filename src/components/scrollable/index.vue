<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { ComponentClass, ComponentDirection, Nullable } from '../../types/shared'
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { useResizeObserver } from '../../composables/use-browser-observer'
import { once, optimizedOff, optimizedOn } from '../../utils/event'
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
  loading?: boolean
  endThreshold?: number
}

defineOptions({
  name: 'PScrollable',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    fader: true,
    scrollbar: true,
    endThreshold: 10,
  },
)

const emits = defineEmits<{
  scroll: [Event]
  end: [Event, ComponentDirection]
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
    '--scrollbar-size': props.scrollbarSize,
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

let lastScrollTop = 0
let lastScrollLeft = 0
let lastScrollInited = false

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
    lastScrollInited = true
    return
  }

  const currTop = el.scrollTop
  const currLeft = el.scrollLeft

  let movedY = false
  let movedX = false

  if (!lastScrollInited) {
    lastScrollTop = currTop
    lastScrollLeft = currLeft
    lastScrollInited = true
  } else {
    movedY = currTop !== lastScrollTop
    movedX = currLeft !== lastScrollLeft
  }

  const endDistance = props.endThreshold ?? 0

  // 仅在对应方向发生滚动时才进行该方向的 end 判定
  if (movedY) {
    const distanceToBottom = el.scrollHeight - (currTop + el.clientHeight)
    if (distanceToBottom <= endDistance) {
      emits('end', ev, 'vertical')
    }
  }

  if (movedX) {
    const distanceToRight = el.scrollWidth - (currLeft + el.clientWidth)
    if (distanceToRight <= endDistance) {
      emits('end', ev, 'horizontal')
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
    startThumbPos: scrollInfo.value.verticalThumbTop,
  }

  optimizedOn(document, 'mousemove', onDragMove)
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

  optimizedOn(document, 'mousemove', onDragMove)
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
  optimizedOff(document, 'mousemove', onDragMove)
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
  useResizeObserver([wrapperRef, contentRef], throttledUpdate)
}

onMounted(async () => {
  if (isServer) {
    return
  }
  if (!props.scrollbar && !props.fader) {
    return
  }

  optimizedOn(window, 'resize', updateScrollbarMetrics, { passive: true })
  requestAnimationFrame(updateScrollbarMetrics)
})

onBeforeUnmount(() => {
  optimizedOff(window, 'resize', updateScrollbarMetrics)
  optimizedOff(document, 'mousemove', onDragMove)
  optimizedOff(document, 'mouseup', onEndDrag)
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
      class="pxd-scrollable--content relative scrollbar-hidden max-h-full flex-1 shrink-0 overflow-scroll"
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
        v-if="scrollInfo.isScrollableX"
        aria-hidden="true"
        class="pxd-scrollable--scrollbar-x left-0 right-0 bottom-0 absolute touch-none opacity-(--o) select-none active:opacity-100 motion-safe:transition-opacity"
      >
        <div
          class="pxd-scrollable--thumb h-inherit rounded-full hover:will-change-transform active:opacity-100 motion-safe:transition-colors"
          :style="horizontalThumbStyle"
          @mousedown="startDragHorizontal"
        />
      </div>

      <div
        v-if="scrollInfo.isScrollableY"
        aria-hidden="true"
        class="pxd-scrollable--scrollbar-y top-0 right-0 bottom-0 absolute touch-none opacity-(--o) select-none active:opacity-100 motion-safe:transition-opacity"
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

<style lang="postcss">
.pxd-scrollable--scrollbar-x {
  height: calc(var(--scrollbar-size, 6) * 1px);
}

.pxd-scrollable--scrollbar-y {
  width: calc(var(--scrollbar-size, 6) * 1px);
}

.pxd-scrollable--thumb {
  background-color: var(--scrollbar-color, var(--color-gray-alpha-300));

  &:hover,
  &:active {
    background-color: var(--scrollbar-hover-color, var(--color-gray-alpha-500));
  }
}
</style>
