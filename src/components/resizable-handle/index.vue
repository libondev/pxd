<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { useResizableContext } from '../../contexts/resizable.js'
import { throttleByRaf } from '../../utils/event.js'
import { getUniqueId } from '../../utils/helper.js'
import { PERCENT_TOTAL } from '../resizable/utils'

interface ResizableHandleProps {
  withHandle?: boolean
}

defineOptions({
  name: 'PResizableHandle',
  inheritAttrs: false,
})

defineProps<ResizableHandleProps>()

const KEYBOARD_STEP = 1
const KEYBOARD_STEP_LARGE = 10

const handleKey = getUniqueId('pxd-handle')
const handleEl = shallowRef<HTMLElement>()

const resizableContext = useResizableContext()

const range = computed(() => resizableContext.getPanelRange(handleKey))
const isInert = computed(() => !range.value)
const collapsed = computed(() => resizableContext.isCollapsed(handleKey))
const direction = computed(() => resizableContext.props.direction ?? 'horizontal')
const position = computed(() =>
  range.value ? resizableContext.getPanelSize(range.value.prevIndex) : 0,
)
const bounds = computed(() =>
  range.value
    ? resizableContext.getPanelBounds(range.value.prevIndex)
    : { min: 0, max: PERCENT_TOTAL },
)
const ariaValueNow = computed(() => Math.round(position.value * 100) / 100)
const ariaControls = computed(() => {
  if (!range.value) {
    return undefined
  }

  const { prevIndex, nextIndex } = range.value

  return `${resizableContext.getPanelId(prevIndex)} ${resizableContext.getPanelId(nextIndex)}`
})

let activePointerId: number | null = null
let startPosition = 0
let accumulated = 0
let resized = false

function axisOf(event: PointerEvent) {
  return direction.value === 'horizontal' ? event.clientX : event.clientY
}

function resizeByPixels(delta: number) {
  const containerSize = resizableContext.getContainerSize()

  if (containerSize <= 0) {
    return false
  }

  return resizableContext.resizeByHandle(handleKey, (delta / containerSize) * PERCENT_TOTAL)
}

const flushResize = throttleByRaf(() => {
  if (accumulated === 0) {
    return
  }

  const delta = accumulated
  accumulated = 0
  resized = resizeByPixels(delta) || resized
})

// The capture target is the handle itself, never `event.target`: a child element
// can be swapped mid-drag, which would both throw on release and strand the drag.
// Holding the capture also keeps the drag alive when the pointer leaves the window.
function releaseCapture() {
  const id = activePointerId
  const el = handleEl.value

  activePointerId = null

  if (el === undefined || id === null) {
    return
  }

  try {
    el.releasePointerCapture(id)
  } catch {
    // Already released: the pointer was cancelled or the element went away.
  }
}

function resetDragging() {
  startPosition = 0
  accumulated = 0
  resized = false

  flushResize.cancel()
  releaseCapture()
}

function handlePointerDown(event: PointerEvent) {
  if (isInert.value) {
    return
  }

  activePointerId = event.pointerId
  startPosition = axisOf(event)
  accumulated = 0
  resized = false

  try {
    handleEl.value?.setPointerCapture(event.pointerId)
  } catch {
    // Capture is an optimisation; the drag still works through plain bubbling.
  }
}

function handlePointerMove(event: PointerEvent) {
  if (event.pointerId !== activePointerId) {
    return
  }

  event.preventDefault()

  const position = axisOf(event)
  accumulated += position - startPosition
  startPosition = position

  flushResize()
}

function handlePointerUp(event: PointerEvent) {
  if (event.pointerId !== activePointerId) {
    return
  }

  flushResize.cancel()

  if (accumulated !== 0) {
    const delta = accumulated
    accumulated = 0
    resized = resizeByPixels(delta) || resized
  }

  const didResize = resized
  resetDragging()

  if (didResize) {
    resizableContext.commitChange()
  }
}

function handlePointerCancel(event: PointerEvent) {
  if (event.pointerId !== activePointerId) {
    return
  }

  resetDragging()
}

function handleLostCapture() {
  if (activePointerId === null) {
    return
  }

  resetDragging()
}

function handleKeydown(event: KeyboardEvent) {
  if (isInert.value) {
    return
  }

  const step = event.shiftKey ? KEYBOARD_STEP_LARGE : KEYBOARD_STEP
  const horizontal = direction.value === 'horizontal'
  let delta: number | null = null

  if (event.key === (horizontal ? 'ArrowLeft' : 'ArrowUp')) {
    delta = -step
  } else if (event.key === (horizontal ? 'ArrowRight' : 'ArrowDown')) {
    delta = step
  } else if (event.key === 'Home') {
    delta = bounds.value.min - position.value
  } else if (event.key === 'End') {
    delta = bounds.value.max - position.value
  }

  if (delta === null) {
    return
  }

  event.preventDefault()

  if (resizableContext.resizeByHandle(handleKey, delta)) {
    resizableContext.commitChange()
  }
}

function handleDoubleClick() {
  resizableContext.toggleCollapse(handleKey)
}

onMounted(() => {
  resizableContext.registerHandle(handleKey, handleEl.value)
})

onBeforeUnmount(() => {
  resetDragging()
  resizableContext.unregisterHandle(handleKey)
})
</script>

<template>
  <div
    ref="handleEl"
    role="separator"
    tabindex="0"
    :aria-orientation="direction"
    :aria-valuenow="ariaValueNow"
    :aria-valuemin="bounds.min"
    :aria-valuemax="bounds.max"
    :aria-controls="ariaControls"
    :aria-disabled="isInert || undefined"
    :aria-expanded="!collapsed"
    :data-collapsed="collapsed || undefined"
    :data-handler="withHandle"
    :data-orientation="direction"
    class="pxd-resizable-handle relative shrink-0 touch-none bg-border self-focus-ring select-none hover:after:bg-primary/15 active:after:bg-primary/20 aria-disabled:cursor-default motion-safe:transition-colors after:motion-safe:transition-colors"
    @pointerdown.prevent="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="handlePointerUp"
    @pointercancel="handlePointerCancel"
    @lostpointercapture="handleLostCapture"
    @keydown="handleKeydown"
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

.pxd-resizable-handle[data-collapsed='true']::before {
  opacity: 0.4;
}

.pxd-resizable-handle::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  padding: 4px;
  transform: translate(-50%, -50%);
}

/* Scoped to the handle's own direction: nesting a resizable must not let the
   outer group restyle the inner group's handles. */
.pxd-resizable-handle[data-orientation='horizontal'] {
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

.pxd-resizable-handle[data-orientation='vertical'] {
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
