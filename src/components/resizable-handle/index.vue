<script lang="ts" setup>
defineOptions({
  name: 'PResizableHandle',
})

const emits = defineEmits(['drag'])

let isDragging = false
let startPosition = { x: 0, y: 0 }

function handlePointerDown(e: PointerEvent) {
  isDragging = true
  startPosition = { x: e.clientX, y: e.clientY }
  ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
}

// 处理拖拽移动
function handlePointerMove(e: PointerEvent) {
  if (!isDragging) {
    return
  }

  const deltaX = e.clientX - startPosition.x
  const deltaY = e.clientY - startPosition.y

  emits('drag', { deltaX, deltaY })

  // 更新起始位置
  startPosition = { x: e.clientX, y: e.clientY }
}

// 处理拖拽结束
function handlePointerUp(e: PointerEvent) {
  isDragging = false
  ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
}
</script>

<template>
  <div
    class="pxd-resizable-handle relative bg-border select-none touch-none hover:z-1 hover:bg-primary active:after:bg-primary/50 motion-safe:transition-colors after:motion-safe:transition-colors"
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
