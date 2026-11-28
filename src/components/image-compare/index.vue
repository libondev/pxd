<script lang="ts" setup>
import ArrowLeftRightIcon from '@gdsicon/vue/arrow-left-right'
import { onBeforeUnmount, shallowRef } from 'vue'
import { getRelativePosition } from '../../utils/_internal/slider.js'
import { cachedOn, off, once, throttleByRaf } from '../../utils/event.js'
import { clampValue } from '../../utils/format.js'

defineOptions({
  name: 'PImageCompare',
  inheritAttrs: false,
})

const DRAG_THRESHOLD = 4
const KEYBOARD_STEP = 1
const KEYBOARD_STEP_LARGE = 10

let rect: DOMRect | null = null
let pointerId: number | null = null
let startX = 0
let startY = 0
let startPosition = 50
let lastClientX: number | null = null
let moved = false
let stopMoveListener: (() => void) | null = null

const scheduleUpdate = throttleByRaf(() => {
  if (lastClientX !== null) {
    updatePosition(lastClientX)
  }
})

const rootRef = shallowRef<HTMLElement>()
const position = shallowRef(50)
const dragging = shallowRef(false)

function updatePosition(clientX: number) {
  if (!rect?.width) {
    return
  }

  position.value = clampValue(getRelativePosition(clientX, rect) * 100, 0, 100)
}

function flushPosition(clientX: number) {
  scheduleUpdate.cancel()
  lastClientX = clientX
  updatePosition(clientX)
  lastClientX = null
}

function onPointerDown(event: PointerEvent) {
  if (pointerId !== null || (event.pointerType === 'mouse' && event.button !== 0)) {
    return
  }

  const root = rootRef.value

  if (!root) {
    return
  }

  rect = root.getBoundingClientRect()

  if (!rect.width) {
    return
  }

  pointerId = event.pointerId
  startX = event.clientX
  startY = event.clientY
  startPosition = position.value
  lastClientX = null
  moved = false

  root.focus({ preventScroll: true })

  stopMoveListener = cachedOn(document, 'pointermove', onPointerMove, { passive: false })
  once(document, 'pointerup', onPointerUp)
  once(document, 'pointercancel', onPointerCancel)
}

function onPointerMove(event: PointerEvent) {
  if (event.pointerId !== pointerId) {
    return
  }

  const dx = event.clientX - startX
  const dy = event.clientY - startY

  if (!dragging.value) {
    if (Math.abs(dx) < DRAG_THRESHOLD) {
      if (Math.abs(dy) >= DRAG_THRESHOLD) {
        moved = true
      }

      return
    }

    if (Math.abs(dx) <= Math.abs(dy)) {
      moved = true

      return
    }

    dragging.value = true
    lastClientX = event.clientX
    updatePosition(event.clientX)

    return
  }

  event.preventDefault()
  lastClientX = event.clientX
  scheduleUpdate()
}

function onPointerUp(event: PointerEvent) {
  if (event.pointerId !== pointerId) {
    return
  }

  if (dragging.value) {
    flushPosition(event.clientX)
  } else if (!moved) {
    updatePosition(event.clientX)
  }

  stopDragging()
}

function onPointerCancel(event: PointerEvent) {
  if (event.pointerId !== pointerId) {
    return
  }

  if (dragging.value) {
    position.value = startPosition
  }

  stopDragging()
}

function stopDragging() {
  pointerId = null
  rect = null
  startPosition = position.value
  lastClientX = null
  moved = false
  dragging.value = false

  scheduleUpdate.cancel()
  stopMoveListener?.()
  stopMoveListener = null
  off(document, 'pointerup', onPointerUp)
  off(document, 'pointercancel', onPointerCancel)
}

function onKeyDown(event: KeyboardEvent) {
  const step = event.shiftKey ? KEYBOARD_STEP_LARGE : KEYBOARD_STEP

  let next: number

  switch (event.key) {
    case 'ArrowLeft':
    case 'ArrowDown':
      next = position.value - step
      break
    case 'ArrowRight':
    case 'ArrowUp':
      next = position.value + step
      break
    case 'Home':
      next = 0
      break
    case 'End':
      next = 100
      break
    default:
      return
  }

  event.preventDefault()
  position.value = clampValue(next, 0, 100)
}

onBeforeUnmount(stopDragging)
</script>

<template>
  <div
    ref="rootRef"
    data-image-compare
    role="slider"
    aria-label="Image compare"
    aria-orientation="horizontal"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="Math.round(position)"
    :aria-valuetext="`${Math.round(position)}%`"
    tabindex="0"
    :data-dragging="dragging || undefined"
    class="pxd-image-compare group relative isolate cursor-col-resize touch-pan-y overflow-hidden bg-gray-200 self-focus-ring outline-none select-none"
    v-bind="$attrs"
    @dragstart.prevent
    @pointerdown="onPointerDown"
    @keydown="onKeyDown"
  >
    <div
      data-image-compare-trailing
      class="pxd-image-compare--trailing inset-0 absolute isolate overflow-hidden"
    >
      <slot name="trailing" />
    </div>

    <div
      data-image-compare-leading
      class="pxd-image-compare--leading inset-0 absolute isolate z-1 overflow-hidden"
      :style="{ clipPath: `inset(0 ${100 - position}% 0 0)` }"
    >
      <slot name="leading" />
    </div>

    <div
      data-image-compare-divider
      class="pxd-image-compare--divider inset-y-0 pointer-events-none absolute z-1"
      :style="{ left: `${position}%` }"
    >
      <span
        class="pxd-image-compare--line inset-y-0 w-0.5 bg-white absolute left-1/2 -translate-x-1/2"
      />

      <span
        aria-hidden="true"
        class="pxd-image-compare--knob size-9 absolute top-1/2 left-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-gray-alpha-300 bg-background-100 text-foreground shadow-medium group-hover:scale-105 group-data-[dragging=true]:scale-90 motion-safe:transition-appearance"
      >
        <ArrowLeftRightIcon class="size-4" />
      </span>
    </div>
  </div>
</template>

<style lang="postcss">
.pxd-image-compare--line {
  box-shadow: 0 0 6px rgb(255 255 255 / 0.5);
}
</style>
