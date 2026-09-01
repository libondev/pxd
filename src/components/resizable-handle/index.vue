<script lang="ts" setup>
import { onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { useResizableContext } from '../../contexts/resizable'
import { getUniqueId } from '../../utils/helper'

interface ResizableHandleProps {
  withHandle?: boolean
}

defineOptions({
  name: 'PResizableHandle',
  inheritAttrs: false,
})

defineProps<ResizableHandleProps>()

const handleKey = getUniqueId()
const handleEl = shallowRef<HTMLElement>()

const resizableContext = useResizableContext()

let isDragging = false
let startPosition = { x: 0, y: 0 }

function onDrag(delta: { deltaX: number; deltaY: number }) {
  resizableContext?.onHandleDrag(handleKey, delta)
}

function handlePointerDown(e: PointerEvent) {
  isDragging = true
  startPosition = { x: e.clientX, y: e.clientY }
  ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
}

function handlePointerMove(e: PointerEvent) {
  if (!isDragging) {
    return
  }

  const deltaX = e.clientX - startPosition.x
  const deltaY = e.clientY - startPosition.y

  onDrag({ deltaX, deltaY })

  startPosition = { x: e.clientX, y: e.clientY }
}

function handlePointerUp(e: PointerEvent) {
  ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
  isDragging = false
}

function handleDoubleClick() {
  resizableContext?.resetPanels()
}

onMounted(() => {
  resizableContext?.registerHandle(
    handleKey,
    {
      onDrag,
    },
    handleEl.value,
  )
})

onBeforeUnmount(() => {
  resizableContext?.unregisterHandle(handleKey)
})
</script>

<template>
  <div
    ref="handleEl"
    class="pxd-resizable-handle relative shrink-0 touch-none bg-border select-none hover:after:bg-primary/15 active:after:bg-primary/20 motion-safe:transition-colors after:motion-safe:transition-colors"
    :data-handler="withHandle"
    @pointerdown.prevent="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="handlePointerUp"
    @pointercancel="handlePointerUp"
    @dblclick.prevent.stop="handleDoubleClick"
    v-bind="$attrs"
  />
</template>

<style lang="postcss">
.pxd-resizable-handle[data-handler='true']::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 0.5rem;
  transform: translate(-50%, -50%);
  background-color: var(--color-gray-300);
  pointer-events: none;
  z-index: 1;
}

.pxd-resizable-handle::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  padding: 4px;
  transform: translate(-50%, -50%);
}

.pxd-resizable[data-orientation='horizontal'] .pxd-resizable-handle {
  width: 1px;
  height: 100%;
  cursor: ew-resize;

  &::before {
    width: 0.375rem;
    height: 1.5rem;
  }

  &::after {
    height: 100%;
  }
}

.pxd-resizable[data-orientation='vertical'] .pxd-resizable-handle {
  width: 100%;
  height: 1px;
  cursor: ns-resize;

  &::before {
    width: 1.5rem;
    height: 0.375rem;
  }

  &::after {
    width: 100%;
  }
}
</style>
