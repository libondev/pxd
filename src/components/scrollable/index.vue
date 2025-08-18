<script setup lang="ts">
import type { ComponentClass, ComponentDirection } from '../../types/shared'
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
  contentClass?: ComponentClass
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

const containerRef = shallowRef<HTMLElement>()

let dragState = {
  isDragging: false,
  direction: null as ComponentDirection | null,
  startClientPos: 0,
  startScrollPos: 0,
  containerSize: 0,
  contentSize: 0,
  thumbSize: 0,
}

const scrollInfo = ref({
  verticalRatio: 0,
  horizontalRatio: 0,
  verticalThumbHeight: 0,
  horizontalThumbWidth: 0,
  verticalThumbTop: 0,
  horizontalThumbLeft: 0,
  isScrollable: { x: false, y: false },
})

const computedStyle = computed(() => {
  return {
    '--sz': `${props.scrollbarSize}px`,
    '--sc': props.scrollbarColor,
    '--shc': props.scrollbarHoverColor,
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
  const wrapper = containerRef.value
  if (!wrapper || !props.scrollbar) {
    return
  }

  const {
    scrollTop,
    scrollLeft,
    scrollWidth,
    scrollHeight,
    clientWidth,
    clientHeight,
  } = wrapper

  // 检查是否可滚动
  const isScrollableX = scrollWidth > clientWidth
  const isScrollableY = scrollHeight > clientHeight

  // 计算滚动条尺寸比例
  const verticalRatio = clientHeight / scrollHeight
  const horizontalRatio = clientWidth / scrollWidth

  // 计算滚动条滑块尺寸
  const verticalThumbHeight = Math.max(clientHeight * verticalRatio, 30)
  const horizontalThumbWidth = Math.max(clientWidth * horizontalRatio, 30)

  // 计算可滚动区域
  const scrollableHeight = clientHeight - verticalThumbHeight
  const scrollableWidth = clientWidth - horizontalThumbWidth

  // 计算滑块位置的百分比
  let verticalScrollPercentage = scrollTop / (scrollHeight - clientHeight)
  let horizontalScrollPercentage = scrollLeft / (scrollWidth - clientWidth)

  // 确保百分比在0-1之间
  verticalScrollPercentage = Math.max(0, Math.min(1, verticalScrollPercentage))
  horizontalScrollPercentage = Math.max(0, Math.min(1, horizontalScrollPercentage))

  const verticalThumbTop = verticalScrollPercentage * scrollableHeight
  const horizontalThumbLeft = horizontalScrollPercentage * scrollableWidth

  // 更新状态
  scrollInfo.value = {
    isScrollable: { x: isScrollableX, y: isScrollableY },
    verticalRatio,
    horizontalRatio,
    verticalThumbHeight,
    horizontalThumbWidth,
    verticalThumbTop,
    horizontalThumbLeft,
  }
}

const throttledUpdate = throttleByRaf(updateScrollbarMetrics)

function onContainerScroll(ev: Event) {
  emits('scroll', ev)

  // 只有在非拖拽状态下才更新滚动条位置
  if (props.scrollbar && !dragState.isDragging) {
    throttledUpdate()
  }
}

function startDragVertical(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()

  const wrapper = containerRef.value
  if (!wrapper) {
    return
  }

  dragState = {
    isDragging: true,
    direction: 'vertical',
    startClientPos: e.clientY,
    startScrollPos: scrollInfo.value.verticalThumbTop,
    containerSize: wrapper.clientHeight,
    contentSize: wrapper.scrollHeight,
    thumbSize: scrollInfo.value.verticalThumbHeight,
  }

  on(document, 'mousemove', onDragMove)
  once(document, 'mouseup', onEndDrag)
}

function startDragHorizontal(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()

  const wrapper = containerRef.value
  if (!wrapper) {
    return
  }

  dragState = {
    isDragging: true,
    direction: 'horizontal',
    startClientPos: e.clientX,
    startScrollPos: scrollInfo.value.horizontalThumbLeft,
    containerSize: wrapper.clientWidth,
    contentSize: wrapper.scrollWidth,
    thumbSize: scrollInfo.value.horizontalThumbWidth,
  }

  on(document, 'mousemove', onDragMove)
  once(document, 'mouseup', onEndDrag)
}

function onDragMove(e: MouseEvent) {
  if (!dragState.isDragging || !dragState.direction) {
    return
  }

  const wrapper = containerRef.value
  if (!wrapper) {
    return
  }

  const { direction, startClientPos, startScrollPos, containerSize, contentSize } = dragState

  if (direction === 'vertical') {
    const deltaY = e.clientY - startClientPos

    const scrollableHeight = containerSize - scrollInfo.value.verticalThumbHeight

    const newThumbTop = Math.max(0, Math.min(scrollableHeight, startScrollPos + deltaY))

    const scrollRatio = newThumbTop / scrollableHeight
    wrapper.scrollTop = scrollRatio * (contentSize - containerSize)

    scrollInfo.value.verticalThumbTop = newThumbTop

    return
  }

  const deltaX = e.clientX - startClientPos

  const scrollableWidth = containerSize - scrollInfo.value.horizontalThumbWidth

  const newThumbLeft = Math.max(0, Math.min(scrollableWidth, startScrollPos + deltaX))

  const scrollRatio = newThumbLeft / scrollableWidth
  wrapper.scrollLeft = scrollRatio * (wrapper.scrollWidth - containerSize)

  scrollInfo.value.horizontalThumbLeft = newThumbLeft
}

function onEndDrag() {
  dragState.isDragging = false
  dragState.direction = null
  off(document, 'mousemove', onDragMove)

  throttledUpdate.cancel()

  requestAnimationFrame(updateScrollbarMetrics)
}

function scrollTo(top: number, left: number) {
  if (!containerRef.value) {
    return
  }

  containerRef.value.scrollTo({ top, left })
}

if (props.scrollbar) {
  useResizeObserver(containerRef, throttledUpdate)
}

onMounted(async () => {
  if (isServer) {
    return
  }

  if (!props.scrollbar && !props.fader) {
    return
  }

  on(window, 'resize', updateScrollbarMetrics, { passive: true })
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
    class="pxd-scrollable group/scrollable sm:[--o:0] relative flex overflow-hidden hover:[--o:1]"
    :style="computedStyle"
  >
    <div
      ref="containerRef"
      :class="contentClass"
      class="pxd-scrollable--content relative scrollbar-hidden max-h-full flex-1 overflow-scroll"
      @scroll.passive="onContainerScroll"
    >
      <slot />
    </div>

    <PFader
      v-if="fader"
      :size="faderSize"
      :color="faderColor"
      :container="containerRef"
      :direction="faderDirection"
    />

    <template v-if="scrollbar">
      <div
        v-show="scrollInfo.isScrollable.y"
        aria-hidden="true"
        class="pxd-scrollable--scrollbar-y top-0 right-0 bottom-0 px-1 absolute touch-none opacity-(--o) select-none active:opacity-100 motion-safe:transition-opacity"
        style="width:calc(var(--sz) + 8px)"
      >
        <div
          class="pxd-scrollable--thumb absolute w-(--sz) rounded-full bg-(--sc) hover:bg-(--shc) hover:will-change-transform active:bg-(--shc) active:opacity-100 motion-safe:transition-colors"
          :style="verticalThumbStyle"
          @mousedown="startDragVertical"
        />
      </div>

      <div
        v-show="scrollInfo.isScrollable.x"
        aria-hidden="true"
        class="pxd-scrollable--scrollbar-x left-0 right-0 bottom-0 py-1 absolute touch-none opacity-(--o) select-none active:opacity-100 motion-safe:transition-opacity"
        style="height:calc(var(--sz) + 8px)"
      >
        <div
          class="pxd-scrollable--thumb absolute h-(--sz) rounded-full bg-(--sc) hover:bg-(--shc) hover:will-change-transform active:bg-(--shc) active:opacity-100 motion-safe:transition-colors"
          :style="horizontalThumbStyle"
          @mousedown="startDragHorizontal"
        />
      </div>
    </template>
  </div>
</template>
