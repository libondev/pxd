<script lang="ts" setup>
import type { ResizableEmits, ResizableProps } from './types'
import { computed, onMounted, shallowRef, watch } from 'vue'
import { useModelValue } from '../../composables/_internal/use-model-value.js'
import { useResizeObserver } from '../../composables/use-resize-observer.js'
import { throttleByRaf } from '../../utils/event.js'
import { clampValue } from '../../utils/format.js'
import { getUniqueId } from '../../utils/helper.js'
import { isNil } from '../../utils/is.js'

type Pair = [number, number]

interface DragState {
  pointerId: number
  position: number
  delta: number
  resized: boolean
}

defineOptions({
  name: 'PResizable',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})
const props = withDefaults(defineProps<ResizableProps>(), {
  direction: 'horizontal',
  modelValue: null,
  minSize: () => [0, 0],
  defaultValue: () => [PERCENT_TOTAL / 2, PERCENT_TOTAL / 2],
  handle: false,
  disabled: false,
  unit: 'percent',
})

const emits = defineEmits<ResizableEmits>()

const PERCENT_TOTAL = 100
const KEYBOARD_STEP = 1
const KEYBOARD_STEP_LARGE = 10
const uid = getUniqueId('pxd-resizable')
const leadingId = `${uid}-leading`
const trailingId = `${uid}-trailing`
const initialSizes = toPair(isNil(props.modelValue) ? props.defaultValue : props.modelValue)
let drag: DragState | null = null
const flushResize = throttleByRaf(applyPendingDelta)

const containerRef = shallowRef<HTMLElement>()
const handleRef = shallowRef<HTMLElement>()
const containerSize = shallowRef(0)
const isControlled = computed(() => !isNil(props.modelValue))
const isPixel = computed(() => props.unit === 'px')
const innerSizes = shallowRef<Pair>(toPair(props.defaultValue))
/** Percent sizes are measured against 100; pixel sizes fill the measured container. */
const totalSize = computed(() => (isPixel.value ? containerSize.value : PERCENT_TOTAL))
/** Only the leading size of a pixel group comes from the caller. */
const sizes = computed<Pair>(() => {
  const source = toPair(isControlled.value ? props.modelValue : innerSizes.value)
  const leading = source[0]

  return isPixel.value ? [leading, Math.max(totalSize.value - leading, 0)] : source
})
/** The pair the panel slots are handed, updated only when a change settles. */
const settledSizes = shallowRef<Pair>(sizes.value)
const restoreSizes = shallowRef<Pair | null>(null)
const collapsed = computed(() => restoreSizes.value !== null)
const unitSuffix = computed(() => (isPixel.value ? 'px' : '%'))

const bounds = computed<{ min: number; max: number }>(() => {
  const [leading, trailing] = toPair(props.minSize)
  const total = totalSize.value

  if (total <= 0) {
    return { min: sizes.value[0], max: sizes.value[0] }
  }

  if (leading + trailing > total) {
    return { min: 0, max: total }
  }

  return { min: leading, max: total - trailing }
})
const ariaValueNow = computed(() => roundSize(sizes.value[0]))
const ariaValueText = computed(
  () => `${ariaValueNow.value}${unitSuffix.value}${collapsed.value ? ', folded' : ''}`,
)

const modelValue = useModelValue(props, emits, { withChange: false })

useResizeObserver(containerRef, syncContainerSize)

function roundSize(value: number): number {
  return Math.round(value * 100) / 100
}

function toPair(value?: number[] | null): Pair {
  return [value?.[0] ?? 0, value?.[1] ?? 0]
}

function setSizes([leading, trailing]: Pair) {
  const [currentLeading, currentTrailing] = sizes.value
  const nextLeading = roundSize(leading)
  const next: Pair = isPixel.value
    ? [nextLeading, roundSize(Math.max(totalSize.value - nextLeading, 0))]
    : [nextLeading, roundSize(trailing)]

  if (next[0] === currentLeading && next[1] === currentTrailing) {
    return false
  }

  if (!isControlled.value) {
    innerSizes.value = next
  }

  modelValue.value = next

  return true
}

function applyDelta(delta: number) {
  const [leading, trailing] = sizes.value
  const { min, max } = bounds.value
  const applied = clampValue(delta, min - leading, max - leading)

  if (applied === 0) {
    return false
  }

  const nextLeading = roundSize(leading + applied)
  const changed = setSizes([nextLeading, roundSize(leading + trailing - nextLeading)])

  if (changed) {
    restoreSizes.value = null
  }

  return changed
}

function syncContainerSize() {
  const container = containerRef.value

  if (!container) {
    containerSize.value = 0
    return
  }

  containerSize.value =
    props.direction === 'horizontal' ? container.offsetWidth : container.offsetHeight
}

function applyPendingDelta() {
  if (!drag || drag.delta === 0) {
    return
  }

  const delta = drag.delta

  drag.delta = 0
  drag.resized = applyPointerDelta(delta) || drag.resized
}

function applyPointerDelta(delta: number) {
  if (isPixel.value) {
    return applyDelta(delta)
  }

  if (containerSize.value <= 0) {
    return false
  }

  return applyDelta((delta / containerSize.value) * PERCENT_TOTAL)
}

function commitChange() {
  emits('change', sizes.value.slice())
}

function toggleCollapse() {
  if (props.disabled) {
    return
  }

  const restore = restoreSizes.value

  if (restore) {
    restoreSizes.value = null

    if (setSizes(restore)) {
      commitChange()
    }

    return
  }

  restoreSizes.value = [sizes.value[0], sizes.value[1]]

  const { min } = bounds.value

  if (setSizes([min, totalSize.value - min])) {
    commitChange()
  }
}

function reset() {
  restoreSizes.value = null

  if (setSizes(initialSizes)) {
    emits('reset', sizes.value.slice())
  }
}

function axisOf(event: PointerEvent) {
  return props.direction === 'horizontal' ? event.clientX : event.clientY
}

function resetDragging() {
  const pointerId = drag?.pointerId
  const handle = handleRef.value

  flushResize.cancel()
  drag = null
  settledSizes.value = sizes.value

  if (pointerId === undefined || !handle) {
    return
  }

  try {
    handle.releasePointerCapture(pointerId)
  } catch {}
}

function handlePointerDown(event: PointerEvent) {
  if (props.disabled) {
    return
  }

  drag = {
    pointerId: event.pointerId,
    position: axisOf(event),
    delta: 0,
    resized: false,
  }
  syncContainerSize()

  try {
    handleRef.value?.setPointerCapture(event.pointerId)
  } catch {}
}

function handlePointerMove(event: PointerEvent) {
  if (!drag || event.pointerId !== drag.pointerId) {
    return
  }

  event.preventDefault()

  const position = axisOf(event)

  drag.delta += position - drag.position
  drag.position = position

  flushResize()
}

function handlePointerUp(event: PointerEvent) {
  if (!drag || event.pointerId !== drag.pointerId) {
    return
  }

  flushResize.cancel()
  applyPendingDelta()

  const didResize = drag.resized

  resetDragging()

  if (didResize) {
    commitChange()
  }
}

function handlePointerCancel(event: PointerEvent) {
  if (!drag || event.pointerId !== drag.pointerId) {
    return
  }

  resetDragging()
}

function handleLostCapture() {
  if (!drag) {
    return
  }

  resetDragging()
}

function handleKeydown(event: KeyboardEvent) {
  if (props.disabled) {
    return
  }

  const step = event.shiftKey ? KEYBOARD_STEP_LARGE : KEYBOARD_STEP
  const horizontal = props.direction === 'horizontal'
  let delta: number | null = null

  if (event.key === (horizontal ? 'ArrowLeft' : 'ArrowUp')) {
    delta = -step
  } else if (event.key === (horizontal ? 'ArrowRight' : 'ArrowDown')) {
    delta = step
  } else if (event.key === 'Home') {
    delta = bounds.value.min - sizes.value[0]
  } else if (event.key === 'End') {
    delta = bounds.value.max - sizes.value[0]
  }

  if (delta === null) {
    return
  }

  event.preventDefault()

  if (applyDelta(delta)) {
    commitChange()
  }
}

/** Only the leading panel of a pixel group gets a basis; the trailing one fills. */
function panelStyle(index: number) {
  if (isPixel.value && index === 1) {
    return {}
  }

  return {
    flexBasis: `${sizes.value[index]}${unitSuffix.value}`,
  }
}

watch(sizes, (value) => {
  if (!drag) {
    settledSizes.value = value
  }
})

onMounted(syncContainerSize)

defineExpose({
  getPanelSizes: () => sizes.value.slice(),
  reset,
})
</script>

<template>
  <div
    data-resizable
    ref="containerRef"
    :data-orientation="direction"
    :data-unit="unit"
    class="pxd-resizable flex size-full max-w-full flex-row overflow-hidden data-[orientation=vertical]:flex-col"
    v-bind="$attrs"
  >
    <div
      :id="leadingId"
      class="pxd-resizable-panel min-w-0 min-h-0 overflow-hidden"
      :style="panelStyle(0)"
    >
      <slot name="leading" :size="settledSizes[0]" />
    </div>

    <div
      ref="handleRef"
      role="separator"
      :tabindex="disabled ? -1 : 0"
      aria-label="Resize the panels"
      :aria-orientation="direction"
      :aria-valuenow="ariaValueNow"
      :aria-valuemin="bounds.min"
      :aria-valuemax="bounds.max"
      :aria-valuetext="ariaValueText"
      :aria-controls="`${leadingId} ${trailingId}`"
      :aria-disabled="disabled || undefined"
      :data-collapsed="collapsed || undefined"
      :data-handler="handle"
      :data-orientation="direction"
      class="pxd-resizable-handle relative shrink-0 touch-none self-focus-ring select-none aria-disabled:cursor-default after:motion-safe:transition-colors"
      @pointerdown.prevent="handlePointerDown"
      @pointermove="handlePointerMove"
      @pointerup="handlePointerUp"
      @pointercancel="handlePointerCancel"
      @lostpointercapture="handleLostCapture"
      @keydown="handleKeydown"
      @dblclick.prevent.stop="toggleCollapse"
    />

    <div
      :id="trailingId"
      class="pxd-resizable-panel min-w-0 min-h-0 overflow-hidden"
      :style="panelStyle(1)"
    >
      <slot name="trailing" :size="settledSizes[1]" />
    </div>
  </div>
</template>

<style lang="postcss">
.pxd-resizable-panel {
  flex-grow: 0;
  flex-shrink: 1;
}

.pxd-resizable[data-unit='px'] .pxd-resizable-panel:first-child {
  flex-shrink: 0;
}

.pxd-resizable[data-unit='px'] .pxd-resizable-panel:last-child {
  flex-basis: 0;
  flex-grow: 1;
}

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
  padding: 2px;
  transform: translate(-50%, -50%);
}

.pxd-resizable-handle:hover::after {
  background-color: var(--color-primary);
}

.pxd-resizable-handle[data-orientation='horizontal'] {
  height: 100%;
  border-left-width: 1px;
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
  border-bottom-width: 1px;
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
