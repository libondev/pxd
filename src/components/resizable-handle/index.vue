<script lang="ts" setup>
import { onBeforeUnmount, onMounted } from 'vue'
import { useResizableContext } from '../../contexts/resizable'
import { getUniqueId } from '../../utils/uid'

defineOptions({
  name: 'PResizableHandle',
})

const context = useResizableContext()

const uniqueId = getUniqueId()

let isDragging = false
let startPosition = { x: 0, y: 0 }

function onDrag(delta: { deltaX: number, deltaY: number }) {
  context?.onHandleDrag(uniqueId, delta)
}

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

  onDrag({ deltaX, deltaY })

  // 更新起始位置
  startPosition = { x: e.clientX, y: e.clientY }
}

// 处理拖拽结束
function handlePointerUp(e: PointerEvent) {
  isDragging = false
  ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
}

// 注册 handle
onMounted(() => {
  context?.registerHandle({
    id: uniqueId,
    onDrag,
  })
})

// 注销 handle
onBeforeUnmount(() => {
  context?.unregisterHandle(uniqueId)
})
</script>

<template>
  <div
    class="pxd-resizable-handle relative bg-border shrink-0 select-none touch-none hover:z-1 hover:after:bg-primary/20 active:after:bg-primary/30 motion-safe:transition-colors after:motion-safe:transition-colors"
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

[data-direction='horizontal'] .pxd-resizable-handle {
  width: 1px;
  height: 100%;
  cursor: ew-resize;

  &::after {
    height: 100%;
  }
}

[data-direction='vertical'] .pxd-resizable-handle {
  width: 100%;
  height: 1px;
  cursor: ns-resize;

  &::after {
    width: 100%;
  }
}
</style>
