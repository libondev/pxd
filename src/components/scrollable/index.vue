<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'

interface Props {
  size?: number
  fader?: boolean
  color?: string
  scrollbar?: boolean
  scrollbarWidth?: number
  scrollbarColor?: string
  scrollbarHoverColor?: string
}

defineOptions({
  name: 'PScrollable',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    size: 30,
    fader: true,
    scrollbar: true,
    scrollbarWidth: 6,
    scrollbarColor: 'var(--gray-alpha-300)',
    scrollbarHoverColor: 'var(--gray-alpha-500)',
  },
)

const PADDING = 4
const DOUBLE_PADDING = PADDING * 2

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
  direction: null as 'vertical' | 'horizontal' | null,
  startClientPos: 0,
  startScrollPos: 0,
  containerSize: 0,
  contentSize: 0,
  thumbSize: 0,
})

// 计算垂直滚动条样式
const verticalThumbStyle = computed(() => ({
  height: `${scrollInfo.value.verticalThumbHeight}px`,
  width: `${props.scrollbarWidth}px`,
  transform: `translateY(${scrollInfo.value.verticalThumbTop}px)`,
  cursor: 'pointer',
}))

// 计算水平滚动条样式
const horizontalThumbStyle = computed(() => ({
  width: `${scrollInfo.value.horizontalThumbWidth}px`,
  height: `${props.scrollbarWidth}px`,
  transform: `translateX(${scrollInfo.value.horizontalThumbLeft}px)`,
  cursor: 'pointer',
}))

function updateScrollbarMetrics() {
  const container = scrollContainer.value
  if (!container)
    return

  const {
    scrollTop,
    scrollLeft,
    scrollWidth,
    scrollHeight,
    clientWidth,
    clientHeight,
  } = container

  // 检查是否可滚动
  const isScrollableX = scrollWidth > clientWidth
  const isScrollableY = scrollHeight > clientHeight
  scrollInfo.value.isScrollable = { x: isScrollableX, y: isScrollableY }

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
  const verticalThumbTop = verticalScrollPercentage * (scrollableHeight - DOUBLE_PADDING)
  const horizontalThumbLeft = horizontalScrollPercentage * (scrollableWidth - DOUBLE_PADDING)

  // 更新状态
  scrollInfo.value = {
    ...scrollInfo.value,
    verticalRatio,
    horizontalRatio,
    verticalThumbHeight,
    horizontalThumbWidth,
    verticalThumbTop,
    horizontalThumbLeft,
  }
}

function onContainerScroll(ev: Event) {
  const {
    scrollTop,
    scrollLeft,
    scrollWidth,
    scrollHeight,
    clientWidth,
    clientHeight,
  } = ev.target as HTMLElement

  const hasTop = scrollTop >= props.size
  const hasBottom = scrollTop + clientHeight !== scrollHeight
  const hasLeft = scrollLeft >= props.size
  const hasRight = scrollLeft + clientWidth !== scrollWidth

  faderDirections.value = {
    top: hasTop,
    left: hasLeft,
    right: hasRight,
    bottom: hasBottom,
  }

  // 只有在非拖拽状态下才更新滚动条位置
  if (!dragState.value.isDragging) {
    updateScrollbarMetrics()
  }
}

// 开始拖拽垂直滚动条
function startDragVertical(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()

  const container = scrollContainer.value
  if (!container)
    return

  dragState.value = {
    isDragging: true,
    direction: 'vertical',
    startClientPos: e.clientY,
    startScrollPos: scrollInfo.value.verticalThumbTop,
    containerSize: container.clientHeight,
    contentSize: container.scrollHeight,
    thumbSize: scrollInfo.value.verticalThumbHeight,
  }

  document.addEventListener('mousemove', onDragMove)
  document.addEventListener('mouseup', endDrag)

  // 添加禁止选择类
  document.body.classList.add('select-none')
}

// 开始拖拽水平滚动条
function startDragHorizontal(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()

  const container = scrollContainer.value
  if (!container)
    return

  dragState.value = {
    isDragging: true,
    direction: 'horizontal',
    startClientPos: e.clientX,
    startScrollPos: scrollInfo.value.horizontalThumbLeft,
    containerSize: container.clientWidth,
    contentSize: container.scrollHeight,
    thumbSize: scrollInfo.value.horizontalThumbWidth,
  }

  document.addEventListener('mousemove', onDragMove)
  document.addEventListener('mouseup', endDrag)

  // 添加禁止选择类
  document.body.classList.add('select-none')
}

// 拖拽移动处理
function onDragMove(e: MouseEvent) {
  if (!dragState.value.isDragging || !dragState.value.direction)
    return

  const container = scrollContainer.value
  if (!container)
    return

  const { direction, startClientPos, startScrollPos, containerSize, contentSize } = dragState.value

  if (direction === 'vertical') {
    // 计算移动距离
    const deltaY = e.clientY - startClientPos

    // 计算可滚动区域
    const scrollableHeight = containerSize - scrollInfo.value.verticalThumbHeight

    // 计算新的滑块位置（考虑padding）
    const newThumbTop = Math.max(0, Math.min(scrollableHeight - DOUBLE_PADDING, startScrollPos + deltaY))

    // 计算并设置容器的滚动位置
    const scrollRatio = newThumbTop / (scrollableHeight - DOUBLE_PADDING)
    container.scrollTop = scrollRatio * (contentSize - containerSize)

    // 直接更新滑块位置
    scrollInfo.value.verticalThumbTop = newThumbTop
  }
  else {
    // 计算移动距离
    const deltaX = e.clientX - startClientPos

    // 计算可滚动区域
    const scrollableWidth = containerSize - scrollInfo.value.horizontalThumbWidth

    // 计算新的滑块位置（考虑padding）
    const newThumbLeft = Math.max(0, Math.min(scrollableWidth - DOUBLE_PADDING, startScrollPos + deltaX))

    // 计算并设置容器的滚动位置
    const scrollRatio = newThumbLeft / (scrollableWidth - DOUBLE_PADDING)
    container.scrollLeft = scrollRatio * (container.scrollWidth - containerSize)

    // 直接更新滑块位置
    scrollInfo.value.horizontalThumbLeft = newThumbLeft
  }
}

// 结束拖拽
function endDrag() {
  dragState.value.isDragging = false
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', endDrag)

  // 移除禁止选择类
  document.body.classList.remove('select-none')

  // 更新滚动条指标
  updateScrollbarMetrics()
}

onMounted(async () => {
  await nextTick()

  if (!props.scrollbar && !props.fader) {
    return
  }

  const container = scrollContainer.value

  const hasScrollbarX = container.scrollWidth > container.clientWidth
  const hasScrollbarY = container.scrollHeight > container.clientHeight

  faderDirections.value.right = hasScrollbarX
  faderDirections.value.bottom = hasScrollbarY

  container.addEventListener('scroll', onContainerScroll, { passive: true })

  // 初始化滚动条
  updateScrollbarMetrics()

  // 添加窗口大小调整事件监听
  window.addEventListener('resize', updateScrollbarMetrics, { passive: true })
})

onBeforeUnmount(() => {
  scrollContainer.value?.removeEventListener('scroll', onContainerScroll)
  window.removeEventListener('resize', updateScrollbarMetrics)

  // 清除任何可能的拖拽事件监听
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', endDrag)
})
</script>

<template>
  <div
    class="pxd-scrollable group relative overflow-hidden" :style="{
      '--size': `${size}px`,
      '--color': color,
      '--sc': scrollbarColor,
      '--shc': scrollbarHoverColor,
    }"
  >
    <div
      ref="scrollContainer"
      class="pxd-scrollable--content w-full h-full scrollbar-hidden overflow-scroll"
    >
      <slot />
    </div>

    <template v-if="fader">
      <div
        aria-hidden="true"
        :class="{ left: faderDirections.left, right: faderDirections.right }"
        class="pxd-scrollable--x-fader pointer-events-none w-full h-full absolute inset-0"
      />
      <div
        aria-hidden="true"
        :class="{ top: faderDirections.top, bottom: faderDirections.bottom }"
        class="pxd-scrollable--y-fader pointer-events-none w-full h-full absolute inset-0"
      />
    </template>

    <template v-if="scrollbar">
      <div
        v-show="scrollInfo.isScrollable.y"
        class="pxd-scrollable--custom-scrollbar-y absolute top-0 right-0 bottom-0 p-1 opacity-0 group-hover:opacity-100 motion-safe:transition-opacity"
        :style="{ width: `${scrollbarWidth + 8}px` }"
      >
        <div
          class="pxd-scrollable--custom-scrollbar-thumb absolute rounded-full bg-(--sc) hover:bg-(--shc) motion-safe:transition-colors"
          :style="verticalThumbStyle"
          @mousedown="startDragVertical"
        />
      </div>

      <div
        v-show="scrollInfo.isScrollable.x"
        class="pxd-scrollable--custom-scrollbar-x absolute left-0 bottom-0 p-1 opacity-0 group-hover:opacity-100 motion-safe:transition-opacity"
        :style="{
          height: `${scrollbarWidth + 8}px`,
          right: scrollInfo.isScrollable.y ? `${scrollbarWidth + 8}px` : '0',
        }"
      >
        <div
          class="pxd-scrollable--custom-scrollbar-thumb absolute rounded-full bg-(--sc) hover:bg-(--shc) motion-safe:transition-colors"
          :style="horizontalThumbStyle"
          @mousedown="startDragHorizontal"
        />
      </div>
    </template>
  </div>
</template>

<style lang="postcss">
.pxd-scrollable--x-fader,
.pxd-scrollable--y-fader {
  &::before,
  &::after {
    content: '';
    position: absolute;
    backdrop-filter: blur(10px);
    background: linear-gradient(var(--dir), transparent, var(--color, var(--background-100)));
    mask-image: linear-gradient(var(--dir-revert), var(--color, var(--background-100)) 33%, transparent);
    opacity: 0;
  }

  &.left::before,
  &.right::after,
  &.top::before,
  &.bottom::after {
    opacity: 1;
  }
}

.pxd-scrollable--x-fader {
  &::before,
  &::after {
    top: 0;
    width: var(--size, 30px);
    height: 100%;
  }

  &::before {
    left: 0;
    --dir: to left;
    --dir-revert: to right;
  }

  &::after {
    right: 0;
    --dir: to right;
    --dir-revert: to left;
  }
}

.pxd-scrollable--y-fader {
  &::before,
  &::after {
    left: 0;
    width: 100%;
    height: var(--size, 30px);
  }

  &::before {
    top: 0;
    --dir: to top;
    --dir-revert: to bottom;
  }

  &::after {
    bottom: 0;
    --dir: to bottom;
    --dir-revert: to top;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .pxd-scrollable--x-fader,
  .pxd-scrollable--y-fader {
    &::before,
    &::after {
      transition: opacity .2s ease-out;
    }
  }
}

.pxd-scrollable--custom-scrollbar-thumb:active {
  opacity: 1 !important;
}
</style>
