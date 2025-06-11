<script lang="ts" setup>
import { inject, ref } from 'vue'

defineOptions({
  name: 'PResizableHandle',
})

// 获取父组件提供的方向值
const direction = inject('resizable-direction', 'row')
// 获取父组件提供的直接调整大小方法
const onResizeMove = inject('resize-move', (_: any) => {})

// 拖拽状态
const isDragging = ref(false)
const startPosition = ref({ x: 0, y: 0 })

// 处理拖拽开始
function handlePointerDown(e: PointerEvent) {
  isDragging.value = true
  startPosition.value = { x: e.clientX, y: e.clientY }

  ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
}

// 处理拖拽移动
function handlePointerMove(e: PointerEvent) {
  if (!isDragging.value) {
    return
  }

  const delta = direction === 'row'
    ? e.clientX - startPosition.value.x
    : e.clientY - startPosition.value.y

  // 直接调用父组件提供的方法
  if (onResizeMove && typeof onResizeMove === 'function') {
    // 使用元素的dataset属性获取索引
    const handleIndex = Number.parseInt((e.currentTarget as HTMLElement).dataset.index || '0', 10)
    onResizeMove({ delta, direction, index: handleIndex })
  }

  // 更新起始位置
  startPosition.value = { x: e.clientX, y: e.clientY }
}

// 处理拖拽结束
function handlePointerUp(e: PointerEvent) {
  isDragging.value = false
  ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
}
</script>

<template>
  <div
    class="pxd-resizable-handle relative bg-border select-none touch-none hover:bg-primary active:after:bg-primary motion-safe:transition-colors after:motion-safe:transition-colors"
    @pointerdown.prevent="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="handlePointerUp"
    @pointercancel="handlePointerUp"
  />
</template>

<style lang="postcss">
.pxd-resizable-handle::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  padding: 4px;
  transform: translate(-50%, -50%);
}

[data-orientation='row'] .pxd-resizable-handle {
  width: 1px;
  height: 100%;
  cursor: ew-resize;

  &::after {
    height: 100%;
  }
}

[data-orientation='col'] .pxd-resizable-handle {
  width: 100%;
  height: 1px;
  cursor: ns-resize;

  &::after {
    width: 100%;
  }
}
</style>
