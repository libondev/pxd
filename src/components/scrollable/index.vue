<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'

interface Props {
  size?: number
  fader?: boolean
  color?: string
  scrollbar?: boolean
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
    size: 30,
    fader: true,
    scrollbar: true,
    scrollbarSize: 6,
    scrollbarColor: 'var(--gray-alpha-300)',
    scrollbarHoverColor: 'var(--gray-alpha-500)',
  },
)

const emits = defineEmits<{
  scroll: [Event]
}>()

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
  transform: `translateY(${scrollInfo.value.verticalThumbTop}px)`,
}))

// 计算水平滚动条样式
const horizontalThumbStyle = computed(() => ({
  width: `${scrollInfo.value.horizontalThumbWidth}px`,
  transform: `translateX(${scrollInfo.value.horizontalThumbLeft}px)`,
}))

function updateScrollbarMetrics() {
  const wrapper = scrollContainer.value
  if (!wrapper)
    return

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
  emits('scroll', ev)

  if (props.fader) {
    updateDirectionFader()
  }

  // 只有在非拖拽状态下才更新滚动条位置
  if (props.scrollbar && !dragState.value.isDragging) {
    updateScrollbarMetrics()
  }
}

// 滚动时计算是否展示渐变
function updateDirectionFader() {
  const wrapper = scrollContainer.value
  if (!wrapper)
    return

  const {
    scrollTop,
    scrollLeft,
    scrollWidth,
    scrollHeight,
    clientWidth,
    clientHeight,
  } = wrapper

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
}

// 开始拖拽垂直滚动条
function startDragVertical(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()

  const wrapper = scrollContainer.value
  if (!wrapper)
    return

  dragState.value = {
    isDragging: true,
    direction: 'vertical',
    startClientPos: e.clientY,
    startScrollPos: scrollInfo.value.verticalThumbTop,
    containerSize: wrapper.clientHeight,
    contentSize: wrapper.scrollHeight,
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

  const wrapper = scrollContainer.value
  if (!wrapper)
    return

  dragState.value = {
    isDragging: true,
    direction: 'horizontal',
    startClientPos: e.clientX,
    startScrollPos: scrollInfo.value.horizontalThumbLeft,
    containerSize: wrapper.clientWidth,
    contentSize: wrapper.scrollHeight,
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

  const wrapper = scrollContainer.value
  if (!wrapper)
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
    wrapper.scrollTop = scrollRatio * (contentSize - containerSize)

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
    wrapper.scrollLeft = scrollRatio * (wrapper.scrollWidth - containerSize)

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

  const wrapper = scrollContainer.value

  const hasScrollbarX = wrapper.scrollWidth > wrapper.clientWidth
  const hasScrollbarY = wrapper.scrollHeight > wrapper.clientHeight

  faderDirections.value.right = hasScrollbarX
  faderDirections.value.bottom = hasScrollbarY

  wrapper.addEventListener('scroll', onContainerScroll, { passive: true })

  updateScrollbarMetrics()

  window.addEventListener('resize', updateScrollbarMetrics, { passive: true })
})

onBeforeUnmount(() => {
  scrollContainer.value?.removeEventListener('scroll', onContainerScroll)

  window.removeEventListener('resize', updateScrollbarMetrics)
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', endDrag)
})

defineExpose({
  forceUpdate: onContainerScroll,
})
</script>

<template>
  <div
    class="pxd-scrollable group relative overflow-hidden" :style="{
      '--c': color,
      '--s': `${size}px`,
      '--ss': `${scrollbarSize}px`,
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
        aria-hidden="true"
        class="pxd-scrollable--custom-scrollbar-y absolute top-0 right-0 bottom-0 p-1 opacity-0 group-hover:opacity-100 active:opacity-100 motion-safe:transition-opacity"
        style="width:calc(var(--ss) + 8px)"
      >
        <div
          class="pxd-scrollable--custom-scrollbar-thumb absolute rounded-full w-(--ss) bg-(--sc) hover:bg-(--shc) motion-safe:transition-colors"
          :style="verticalThumbStyle"
          @mousedown="startDragVertical"
        />
      </div>

      <div
        v-show="scrollInfo.isScrollable.x"
        aria-hidden="true"
        class="pxd-scrollable--custom-scrollbar-x absolute left-0 right-0 bottom-0 p-1 opacity-0 group-hover:opacity-100 active:opacity-100 motion-safe:transition-opacity"
        style="height:calc(var(--ss) + 8px)"
      >
        <div
          class="pxd-scrollable--custom-scrollbar-thumb absolute rounded-full h-(--ss) bg-(--sc) hover:bg-(--shc) motion-safe:transition-colors"
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
    background: linear-gradient(var(--dir), transparent, var(--c, var(--background-100)));
    mask-image: linear-gradient(var(--dir-revert), var(--c, var(--background-100)) 33%, transparent);
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
    width: var(--s, 30px);
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
    height: var(--s, 30px);
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
