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
  start: Pair
  startCollapsed: boolean
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
  collapsed: null,
  dblclickAction: 'reset',
  handle: false,
  disabled: false,
  unit: 'percent',
  reverse: false,
})

const emits = defineEmits<ResizableEmits>()

const PERCENT_TOTAL = 100
const KEYBOARD_STEP = 1
const KEYBOARD_STEP_LARGE = 10
const UNFOLD_DISTANCE = 10
const uid = getUniqueId('pxd-resizable')
const leadingId = `${uid}-leading`
const trailingId = `${uid}-trailing`
let drag: DragState | null = null
const flushResize = throttleByRaf(flushPointer)

const containerRef = shallowRef<HTMLElement>()
const handleRef = shallowRef<HTMLElement>()
const containerSize = shallowRef(0)
const innerSizes = shallowRef<Pair>(toPair(props.defaultValue))
const innerCollapsed = shallowRef(false)
/** Pointer position in `unit` during a drag; unclamped so a leftward overshoot is not swallowed. */
const dragPointer = shallowRef<number | null>(null)
const dragCollapsed = shallowRef(false)
/** Leading size to restore when a folded panel is expanded without dragging. */
const foldedFrom = shallowRef<number | null>(null)
const isControlled = computed(() => !isNil(props.modelValue))
const isPixel = computed(() => props.unit === 'px')
/** `reverse` only means anything where a panel fills the rest, i.e. under `px`. */
const isReversed = computed(() => isPixel.value && props.reverse)
/** Percent sizes are measured against 100; pixel sizes fill the measured container. */
const totalSize = computed(() => (isPixel.value ? containerSize.value : PERCENT_TOTAL))
/** Under `px` only the pinned panel's size comes from the caller. */
const sizes = computed<Pair>(() => {
  const [leading, trailing] = toPair(isControlled.value ? props.modelValue : innerSizes.value)
  const total = totalSize.value

  if (isReversed.value) {
    return [Math.max(total - trailing, 0), trailing]
  }

  return isPixel.value ? [leading, Math.max(total - leading, 0)] : [leading, trailing]
})

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
const collapsed = computed(() =>
  dragPointer.value === null ? (props.collapsed ?? innerCollapsed.value) : dragCollapsed.value,
)
/** The bound the divider parks against while folded. */
const foldedLeading = computed(() => (isReversed.value ? bounds.value.max : bounds.value.min))
/** Half of the pinned floor; a panel without a floor has nothing to fold past. */
const foldThreshold = computed(
  () => (isReversed.value ? totalSize.value - bounds.value.max : bounds.value.min) / 2,
)
const renderedSizes = computed<Pair>(() => {
  if (collapsed.value) {
    return foldedPair()
  }

  if (dragPointer.value === null) {
    return sizes.value
  }

  const { min, max } = bounds.value
  const pointer = isReversed.value
    ? Math.min(dragPointer.value, max)
    : Math.max(dragPointer.value, min)

  return pairFrom(pointer)
})
/** The pair the panel slots are handed, updated only when a change settles. */
const settledSizes = shallowRef<Pair>(renderedSizes.value)
const unitSuffix = computed(() => (isPixel.value ? 'px' : '%'))
/** An empty panel puts the divider on a container edge, where a line is just residue. */
const isFlush = computed(() => renderedSizes.value[0] <= 0 || renderedSizes.value[1] <= 0)
const ariaValueNow = computed(() => roundSize(renderedSizes.value[0]))
const ariaValueText = computed(() => `${ariaValueNow.value}${unitSuffix.value}`)
/** Folded, the divider is out of the tab order and cannot move, so it exposes no value range. */
const separatorRange = computed(() =>
  collapsed.value
    ? {}
    : {
        'aria-valuenow': ariaValueNow.value,
        'aria-valuemin': bounds.value.min,
        'aria-valuemax': bounds.value.max,
        'aria-valuetext': ariaValueText.value,
      },
)

const modelValue = useModelValue(props, emits, { withChange: false })

useResizeObserver(containerRef, syncContainerSize)

function roundSize(value: number): number {
  return Math.round(value * 100) / 100
}

/** Pixel distance as the group's `unit`. */
function toUnit(px: number): number {
  if (isPixel.value) {
    return px
  }

  return containerSize.value > 0 ? (px / containerSize.value) * PERCENT_TOTAL : 0
}

function toPair(value?: number[] | null): Pair {
  return [value?.[0] ?? 0, value?.[1] ?? 0]
}

function pairFrom(leading: number): Pair {
  const next = roundSize(leading)

  return [next, roundSize(Math.max(totalSize.value - next, 0))]
}

function foldedPair(): Pair {
  const total = roundSize(totalSize.value)

  return isReversed.value ? [total, 0] : [0, total]
}

function writeSizes(next: Pair) {
  if (!isControlled.value) {
    innerSizes.value = next
  }

  modelValue.value = next
}

function setSizes([leading, trailing]: Pair) {
  const [currentLeading, currentTrailing] = sizes.value
  const nextLeading = roundSize(leading)
  const next: Pair = isPixel.value ? pairFrom(nextLeading) : [nextLeading, roundSize(trailing)]

  if (next[0] === currentLeading && next[1] === currentTrailing) {
    return false
  }

  writeSizes(next)

  return true
}

function foldLeading(from: number): boolean {
  foldedFrom.value = from

  if (isNil(props.collapsed)) {
    innerCollapsed.value = true
  }

  emits('update:collapsed', true)

  return setSizes(foldedPair())
}

function clearFold(wasCollapsed: boolean) {
  foldedFrom.value = null

  if (isNil(props.collapsed)) {
    innerCollapsed.value = false
  }

  if (wasCollapsed) {
    emits('update:collapsed', false)
  }
}

function expandLeading(): boolean {
  const wasCollapsed = collapsed.value
  const { min, max } = bounds.value
  const changed = setSizes(pairFrom(clampValue(foldedFrom.value ?? sizes.value[0], min, max)))

  clearFold(wasCollapsed)

  return changed
}

function reset() {
  const wasCollapsed = collapsed.value
  const { min, max } = bounds.value
  const configured = toPair(props.defaultValue)
  const target = isReversed.value ? totalSize.value - configured[1] : configured[0]
  const next = pairFrom(clampValue(target, min, max))
  const changed = setSizes(next)

  clearFold(wasCollapsed)

  if (!changed && !wasCollapsed) {
    return
  }

  if (!changed) {
    writeSizes(next)
  }

  emits('reset', next)
}

function toggleFold() {
  const changed = collapsed.value ? expandLeading() : foldLeading(sizes.value[0])

  if (changed) {
    emits('change', sizes.value.slice())
  }
}

function applyDelta(delta: number) {
  const [leading, trailing] = sizes.value
  const { min, max } = bounds.value
  const applied = clampValue(delta, min - leading, max - leading)

  if (applied === 0) {
    return false
  }

  const nextLeading = roundSize(leading + applied)

  return setSizes([nextLeading, roundSize(leading + trailing - nextLeading)])
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

function flushPointer() {
  const current = dragPointer.value

  if (!drag || current === null || drag.delta === 0) {
    return
  }

  const step = toUnit(drag.delta)

  drag.delta = 0

  if (step === 0) {
    return
  }

  const { min, max } = bounds.value
  const next = roundSize(current + step)
  const pointer = isReversed.value ? Math.max(next, min) : Math.min(next, max)

  if (pointer === current) {
    return
  }

  dragPointer.value = pointer

  const threshold = foldThreshold.value
  const folded =
    threshold > 0 &&
    (isReversed.value ? totalSize.value - pointer <= threshold : pointer <= threshold)

  if (folded !== dragCollapsed.value) {
    dragCollapsed.value = folded
    foldedFrom.value = folded ? foldedLeading.value : null
    emits('update:collapsed', folded)
  }

  modelValue.value = renderedSizes.value.slice()
}

function axisOf(event: PointerEvent) {
  return props.direction === 'horizontal' ? event.clientX : event.clientY
}

function resetDragging() {
  const pointerId = drag?.pointerId

  flushResize.cancel()
  drag = null
  dragPointer.value = null
  dragCollapsed.value = false

  try {
    if (pointerId !== undefined) {
      handleRef.value?.releasePointerCapture(pointerId)
    }
  } catch {}
}

function handlePointerDown(event: PointerEvent) {
  if (props.disabled) {
    return
  }

  syncContainerSize()

  const startCollapsed = collapsed.value
  const [startLeading, startTrailing] = renderedSizes.value
  const { min, max } = bounds.value
  const boundary = isReversed.value ? totalSize.value - foldThreshold.value : foldThreshold.value
  const deadZone = toUnit(UNFOLD_DISTANCE)
  const collapsedPointer = isReversed.value ? boundary + deadZone : boundary - deadZone

  drag = {
    pointerId: event.pointerId,
    position: axisOf(event),
    delta: 0,
    start: [startLeading, startTrailing],
    startCollapsed,
  }
  // A collapsed handle parks one dead zone short of the boundary, so opening it takes a real drag.
  dragPointer.value = startCollapsed
    ? Math.max(collapsedPointer, 0)
    : clampValue(sizes.value[0], min, max)
  dragCollapsed.value = startCollapsed

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

function finishDrag(reportChange: boolean) {
  if (!drag || dragPointer.value === null) {
    return
  }

  flushResize.cancel()
  flushPointer()

  const { start, startCollapsed } = drag
  const folded = dragCollapsed.value
  const [leading, trailing] = renderedSizes.value
  const changed = folded !== startCollapsed || leading !== start[0] || trailing !== start[1]
  const settled: Pair = folded ? foldedPair() : [leading, trailing]

  resetDragging()

  if (!changed) {
    return
  }

  foldedFrom.value = folded ? foldedLeading.value : null

  if (isNil(props.collapsed)) {
    innerCollapsed.value = folded
  }

  setSizes(settled)

  if (reportChange) {
    emits('change', settled)
  }
}

function handlePointerUp(event: PointerEvent) {
  if (drag && event.pointerId === drag.pointerId) {
    finishDrag(true)
  }
}

function handlePointerCancel(event: PointerEvent) {
  if (drag && event.pointerId === drag.pointerId) {
    finishDrag(false)
  }
}

function handleLostCapture() {
  if (drag) {
    finishDrag(false)
  }
}

function handleDblclick() {
  if (props.disabled) {
    return
  }

  if (props.dblclickAction === 'fold') {
    toggleFold()

    return
  }

  reset()
}

function handleKeydown(event: KeyboardEvent) {
  if (props.disabled) {
    return
  }

  const horizontal = props.direction === 'horizontal'
  const back = horizontal ? 'ArrowLeft' : 'ArrowUp'
  const forward = horizontal ? 'ArrowRight' : 'ArrowDown'

  if (![back, forward, 'Home', 'End'].includes(event.key)) {
    return
  }

  event.preventDefault()

  const wasCollapsed = collapsed.value

  if (wasCollapsed) {
    expandLeading()
  }

  const step = event.shiftKey ? KEYBOARD_STEP_LARGE : KEYBOARD_STEP
  const leading = sizes.value[0]
  let delta = event.key === back ? -step : step

  if (event.key === 'Home') {
    delta = bounds.value.min - leading
  } else if (event.key === 'End') {
    delta = bounds.value.max - leading
  }

  if (applyDelta(delta) || wasCollapsed) {
    emits('change', sizes.value.slice())
  }
}

/** Only the pinned panel of a pixel group gets a basis; the other one fills. */
function panelStyle(index: number) {
  if (isPixel.value && index === (isReversed.value ? 0 : 1)) {
    return {}
  }

  return {
    flexBasis: `${renderedSizes.value[index]}${unitSuffix.value}`,
  }
}

/** A panel clipped to nothing is gone for focus and AT, not just for the eye. */
function isPanelEmpty(index: number) {
  return renderedSizes.value[index] <= 0 || undefined
}

watch(renderedSizes, (value) => {
  if (dragPointer.value === null) {
    settledSizes.value = value
  }
})

watch(
  () => props.collapsed,
  (next, prev) => {
    if (isNil(props.collapsed) || dragPointer.value !== null) {
      return
    }

    if (next === true && sizes.value[0] !== 0) {
      foldLeading(sizes.value[0])
    } else if (prev === true) {
      expandLeading()
    }
  },
)

onMounted(syncContainerSize)

defineExpose({
  getPanelSizes: () => renderedSizes.value.slice(),
  reset,
})
</script>

<template>
  <div
    data-resizable
    ref="containerRef"
    :data-orientation="direction"
    :data-unit="unit"
    :data-reverse="reverse || undefined"
    class="pxd-resizable flex size-full max-w-full flex-row overflow-hidden data-[orientation=vertical]:flex-col"
    v-bind="$attrs"
  >
    <div
      :id="leadingId"
      class="pxd-resizable-panel min-w-0 min-h-0 overflow-hidden"
      :style="panelStyle(0)"
      :inert="isPanelEmpty(0)"
    >
      <slot name="leading" :size="settledSizes[0]" />
    </div>

    <div
      ref="handleRef"
      role="separator"
      :tabindex="disabled || collapsed ? -1 : 0"
      aria-label="Resize the panels"
      :aria-orientation="direction"
      v-bind="separatorRange"
      :aria-controls="`${leadingId} ${trailingId}`"
      :aria-disabled="disabled || undefined"
      :data-collapsed="collapsed || undefined"
      :data-flush="isFlush || undefined"
      :data-handler="handle"
      :data-orientation="direction"
      class="pxd-resizable-handle relative shrink-0 touch-none self-focus-ring select-none hover:after:delay-200 aria-disabled:cursor-default after:motion-safe:transition-colors"
      @pointerdown="handlePointerDown"
      @pointermove="handlePointerMove"
      @pointerup="handlePointerUp"
      @pointercancel="handlePointerCancel"
      @lostpointercapture="handleLostCapture"
      @keydown="handleKeydown"
      @dblclick.prevent.stop="handleDblclick"
    />

    <div
      :id="trailingId"
      class="pxd-resizable-panel min-w-0 min-h-0 overflow-hidden"
      :style="panelStyle(1)"
      :inert="isPanelEmpty(1)"
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

/* Fallback for browsers without `inert`: hidden keeps the content out of focus, AT and hit testing. */
.pxd-resizable-panel[inert] {
  visibility: hidden;
}

.pxd-resizable[data-unit='px'] .pxd-resizable-panel:first-child {
  flex-shrink: 0;
}

.pxd-resizable[data-unit='px'] .pxd-resizable-panel:last-child {
  flex-basis: 0;
  flex-grow: 1;
}

.pxd-resizable[data-unit='px'][data-reverse] .pxd-resizable-panel:first-child {
  flex-basis: 0;
  flex-grow: 1;
  flex-shrink: 1;
}

.pxd-resizable[data-unit='px'][data-reverse] .pxd-resizable-panel:last-child {
  flex-grow: 0;
  flex-shrink: 0;
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

.pxd-resizable-handle::after {
  content: '';
  position: absolute;
  background-color: transparent;
}

.pxd-resizable-handle:hover::after {
  background-color: var(--color-primary);
}

.pxd-resizable-handle[data-orientation='horizontal'] {
  width: 1px;
  height: 100%;
  margin-right: -1px;
  cursor: col-resize;
  background-color: var(--color-gray-300);

  &::before {
    width: 0.375rem;
    height: 1.5rem;
  }

  &::after {
    top: 0;
    left: 50%;
    width: 0.25rem;
    height: 100%;
    transform: translateX(-50%);
  }
}

.pxd-resizable-handle[data-orientation='vertical'] {
  width: 100%;
  height: 1px;
  margin-bottom: -1px;
  cursor: row-resize;
  background-color: var(--color-gray-300);

  &::before {
    width: 1.5rem;
    height: 0.375rem;
  }

  &::after {
    top: 50%;
    left: 0;
    width: 100%;
    height: 0.25rem;
    transform: translateY(-50%);
  }
}

.pxd-resizable-handle[data-collapsed='true'],
.pxd-resizable-handle[data-flush='true'] {
  background-color: transparent;
}

.pxd-resizable-handle[data-collapsed='true']::before {
  opacity: 0.4;
}
</style>
