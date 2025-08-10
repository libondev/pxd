<script setup lang="ts">
import type { ComponentClass, ComponentDirection } from '../../types/shared'
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { useResizeObserver } from '../../composables/use-browser-observer'
import { off, on, once } from '../../utils/events'
import { throttleByRaf } from '../../utils/fn'
import { isServer } from '../../utils/is'
import PFader from '../fader/index.vue'

interface Props {
  fader?: boolean
  faderSize?: number
  faderColor?: string
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

const DIFF_THRESHOLD = 1

const scrollContainer = shallowRef<HTMLElement>(null!)

const faderDirections = ref({
  top: false,
  left: false,
  right: false,
  bottom: false,
})

// 滚动条状态
const scrollInfo = ref({
  verticalRatio: 0,
  horizontalRatio: 0,
  verticalThumbHeight: 0,
  horizontalThumbWidth: 0,
  verticalThumbTop: 0,
  horizontalThumbLeft: 0,
  isScrollable: { x: false, y: false },
})

// 拖拽状态
const dragState = ref({
  isDragging: false,
  direction: null as ComponentDirection | null,
  startClientPos: 0,
  startScrollPos: 0,
  containerSize: 0,
  contentSize: 0,
  thumbSize: 0,
})

// 计算垂直滚动条样式
const verticalThumbStyle = computed(() => ({
  height: `${scrollInfo.value.verticalThumbHeight}px`,
  transform: `translateY(${scrollInfo.value.verticalThumbTop}px)`,
}))

// 计算水平滚动条样式
const horizontalThumbStyle = computed(() => ({
  width: `${scrollInfo.value.horizontalThumbWidth}px`,
  transform: `translateX(${scrollInfo.value.horizontalThumbLeft}px)`,
}))

// 滚动时计算是否展示渐变
function updateDirectionFader() {
  const wrapper = scrollContainer.value
  if (!wrapper || !props.fader) {
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

  const hasTop = scrollTop >= props.faderSize
  // 有时候会出现滚动条的位置和最大高度相差 0.x 的误差，所以这里减去一个阈值
  const hasBottom = scrollTop + clientHeight < scrollHeight - DIFF_THRESHOLD
  const hasLeft = scrollLeft >= props.faderSize
  const hasRight = scrollLeft + clientWidth < scrollWidth - DIFF_THRESHOLD

  faderDirections.value = {
    top: hasTop,
    left: hasLeft,
    right: hasRight,
    bottom: hasBottom,
  }
}

function updateScrollbarMetrics() {
  const wrapper = scrollContainer.value
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

  // 正确计算初始位置，不再添加额外的PADDING
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

function updateScrollbarInfo() {
  updateDirectionFader()
  updateScrollbarMetrics()
}

const throttledUpdate = throttleByRaf(() => {
  if (props.fader) {
    updateDirectionFader()
  }

  // 只有在非拖拽状态下才更新滚动条位置
  if (props.scrollbar && !dragState.value.isDragging) {
    updateScrollbarMetrics()
  }
})

function onContainerScroll(ev: Event) {
  emits('scroll', ev)
  throttledUpdate()
}

function startDragVertical(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()

  const wrapper = scrollContainer.value
  if (!wrapper) {
    return
  }

  dragState.value = {
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

  const wrapper = scrollContainer.value
  if (!wrapper) {
    return
  }

  dragState.value = {
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
  if (!dragState.value.isDragging || !dragState.value.direction) {
    return
  }

  const wrapper = scrollContainer.value
  if (!wrapper) {
    return
  }

  const { direction, startClientPos, startScrollPos, containerSize, contentSize } = dragState.value

  if (direction === 'vertical') {
    const deltaY = e.clientY - startClientPos

    const scrollableHeight = containerSize - scrollInfo.value.verticalThumbHeight

    const newThumbTop = Math.max(0, Math.min(scrollableHeight, startScrollPos + deltaY))

    const scrollRatio = newThumbTop / scrollableHeight
    wrapper.scrollTop = scrollRatio * (contentSize - containerSize)

    scrollInfo.value.verticalThumbTop = newThumbTop

    return
  }

  // 计算移动距离
  const deltaX = e.clientX - startClientPos

  // 计算可滚动区域
  const scrollableWidth = containerSize - scrollInfo.value.horizontalThumbWidth

  // 计算新的滑块位置（考虑padding）
  const newThumbLeft = Math.max(0, Math.min(scrollableWidth, startScrollPos + deltaX))

  const scrollRatio = newThumbLeft / scrollableWidth
  wrapper.scrollLeft = scrollRatio * (wrapper.scrollWidth - containerSize)

  scrollInfo.value.horizontalThumbLeft = newThumbLeft
}

// 结束拖拽
function onEndDrag() {
  dragState.value.isDragging = false
  dragState.value.direction = null
  off(document, 'mousemove', onDragMove)

  throttledUpdate.cancel()

  requestAnimationFrame(updateScrollbarMetrics)
}

function scrollTo(top: number, left: number) {
  if (!scrollContainer.value) {
    return
  }

  scrollContainer.value.scrollTo({ top, left })
}

if (props.scrollbar || props.fader) {
  useResizeObserver(scrollContainer, updateScrollbarInfo)
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
  forceUpdate: updateScrollbarInfo,
})
</script>

<template>
  <div
    class="pxd-scrollable group/scrollable sm:[--sv:0] relative flex overflow-hidden hover:[--sv:1]"
    :style="{
      '--scrollbar-size': `${scrollbarSize}px`,
      '--scrollbar-color': scrollbarColor,
      '--scrollbar-hover-color': scrollbarHoverColor,
    }"
  >
    <div
      ref="scrollContainer"
      :class="contentClass"
      class="pxd-scrollable--content relative scrollbar-hidden max-h-full flex-1 overflow-scroll"
      @scroll.passive="onContainerScroll"
    >
      <slot />
    </div>

    <template v-if="fader">
      <PFader
        :size="faderSize"
        :color="faderColor"
        direction="vertical"
        :top="faderDirections.top"
        :bottom="faderDirections.bottom"
      />

      <PFader
        :size="faderSize"
        :color="faderColor"
        direction="horizontal"
        :left="faderDirections.left"
        :right="faderDirections.right"
      />
    </template>

    <template v-if="scrollbar">
      <div
        v-show="scrollInfo.isScrollable.y"
        aria-hidden="true"
        class="pxd-scrollable--scrollbar-y top-0 right-0 bottom-0 px-1 absolute touch-none opacity-(--sv) select-none active:opacity-100 motion-safe:transition-opacity"
        style="width:calc(var(--scrollbar-size) + 8px)"
      >
        <div
          class="pxd-scrollable--thumb absolute w-(--scrollbar-size) rounded-full bg-(--scrollbar-color) hover:bg-(--scrollbar-hover-color) hover:will-change-transform active:bg-(--scrollbar-hover-color) active:opacity-100 motion-safe:transition-colors"
          :style="verticalThumbStyle"
          @mousedown="startDragVertical"
        />
      </div>

      <div
        v-show="scrollInfo.isScrollable.x"
        aria-hidden="true"
        class="pxd-scrollable--scrollbar-x left-0 right-0 bottom-0 py-1 absolute touch-none opacity-(--sv) select-none active:opacity-100 motion-safe:transition-opacity"
        style="height:calc(var(--scrollbar-size) + 8px)"
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
