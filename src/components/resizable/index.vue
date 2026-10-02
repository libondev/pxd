<script lang="ts" setup>
import type { ResizableEmits, ResizableProps } from './types'
import { computed, shallowRef, watch } from 'vue'
import { useModelValue } from '../../composables/_internal/use-model-value.js'
import { throttleByRaf } from '../../utils/event.js'
import { getUniqueId } from '../../utils/helper.js'
import { isNil } from '../../utils/is.js'
import { clamp, PERCENT_TOTAL, roundSize, toPair } from './utils'

defineOptions({
  name: 'PResizable',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

type Pair = [number, number]

const props = withDefaults(defineProps<ResizableProps>(), {
  direction: 'horizontal',
  modelValue: null,
  minSize: () => [0, 0],
  defaultValue: () => [PERCENT_TOTAL / 2, PERCENT_TOTAL / 2],
  handle: false,
  disabled: false,
})

const emits = defineEmits<ResizableEmits>()

const uid = getUniqueId('pxd-resizable')
const containerRef = shallowRef<HTMLElement>()
const handleRef = shallowRef<HTMLElement>()

const modelValue = useModelValue(props, emits, { withChange: false })

const isControlled = computed(() => !isNil(props.modelValue))
const innerSizes = shallowRef<Pair>(toPair(props.defaultValue))
const sizes = computed<Pair>(() =>
  isControlled.value ? toPair(props.modelValue) : innerSizes.value,
)

/**
 * The range the leading panel may travel through. The trailing panel needs no
 * bounds of its own: the pair always sums to 100, so the leading panel's floor
 * already is the trailing panel's ceiling and the other way round.
 */
const bounds = computed<{ min: number; max: number }>(() => {
  const [leading, trailing] = toPair(props.minSize)

  if (leading + trailing > PERCENT_TOTAL) {
    return { min: 0, max: PERCENT_TOTAL }
  }

  return { min: leading, max: PERCENT_TOTAL - trailing }
})

const leadingId = `${uid}-leading`
const trailingId = `${uid}-trailing`
const collapsed = shallowRef(false)
// The pair as it was before folding, so expanding gives back what the user was
// working with rather than the configured starting point.
let expandedPair: Pair | null = null
let initialPair: Pair | null = null

watch(
  sizes,
  ([leading, trailing]) => {
    initialPair ??= [leading, trailing]
  },
  { immediate: true, flush: 'sync' },
)

function setSizes(next: Pair) {
  const current = sizes.value
  const rounded: Pair = [roundSize(next[0]), roundSize(next[1])]

  if (rounded[0] === current[0] && rounded[1] === current[1]) {
    return false
  }

  if (!isControlled.value) {
    innerSizes.value = rounded
  }

  modelValue.value = rounded

  return true
}

function resize(deltaPercent: number) {
  const [leading, trailing] = sizes.value
  const { min, max } = bounds.value

  // Clamp the movement so the leading panel stays inside its own range, then
  // hand the trailing panel the same delta so the pair keeps summing to 100%.
  const applied = clamp(deltaPercent, min - leading, max - leading)

  if (applied === 0) {
    return false
  }

  // The trailing panel is derived from the already rounded value, so the pair
  // keeps the exact sum it had and repeated drags cannot drift.
  const newLeading = roundSize(leading + applied)

  return setSizes([newLeading, roundSize(leading + trailing - newLeading)])
}

/**
 * Moving the divider brings a folded pair back, so a collapsed panel is never a
 * dead end. The remembered sizes go with it: they described a pair that no
 * longer exists once it has been moved somewhere else.
 */
function applyDelta(deltaPercent: number) {
  const changed = resize(deltaPercent)

  if (changed && collapsed.value) {
    collapsed.value = false
    expandedPair = null
  }

  return changed
}

function resizeByPixels(delta: number) {
  const container = containerRef.value

  if (!container) {
    return false
  }

  const containerSize =
    props.direction === 'horizontal' ? container.offsetWidth : container.offsetHeight

  if (containerSize <= 0) {
    return false
  }

  return applyDelta((delta / containerSize) * PERCENT_TOTAL)
}

function commitChange() {
  emits('change', sizes.value.slice())
}

function toggleCollapse() {
  if (props.disabled) {
    return
  }

  const [leading, trailing] = sizes.value

  if (collapsed.value) {
    const restore = expandedPair ?? initialPair ?? ([leading, trailing] as Pair)

    expandedPair = null
    collapsed.value = false

    if (setSizes([restore[0], restore[1]])) {
      commitChange()
    }

    return
  }

  expandedPair = [leading, trailing]
  collapsed.value = true

  const { min } = bounds.value
  // Whatever the leading panel gives up goes to its neighbour, so the pair keeps
  // summing to 100% while folded.
  if (setSizes([min, PERCENT_TOTAL - min])) {
    commitChange()
  }
}

function reset() {
  const restore = initialPair ?? toPair(props.defaultValue)

  expandedPair = null
  collapsed.value = false

  if (setSizes([restore[0], restore[1]])) {
    emits('reset', sizes.value.slice())
  }
}

let activePointerId: number | null = null
let startPosition = 0
let accumulated = 0
let resized = false

function axisOf(event: PointerEvent) {
  return props.direction === 'horizontal' ? event.clientX : event.clientY
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
  const el = handleRef.value

  activePointerId = null

  if (!el || id === null) {
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
  if (props.disabled) {
    return
  }

  activePointerId = event.pointerId
  startPosition = axisOf(event)
  accumulated = 0
  resized = false

  try {
    handleRef.value?.setPointerCapture(event.pointerId)
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
    commitChange()
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

const KEYBOARD_STEP = 1
const KEYBOARD_STEP_LARGE = 10

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
    delta = bounds.value.min - position.value
  } else if (event.key === 'End') {
    delta = bounds.value.max - position.value
  }

  if (delta === null) {
    return
  }

  event.preventDefault()

  if (applyDelta(delta)) {
    commitChange()
  }
}

function isPercent(value: number) {
  return value >= 0 && value <= PERCENT_TOTAL
}

function warnLength(name: string, value: number[]) {
  warn(
    `${name} holds ${value.length} value${value.length === 1 ? '' : 's'} but the group has 2 panels; only the first two are used.`,
  )
}

function warn(message: string) {
  if (import.meta.env?.DEV) {
    console.warn(`[pxd] PResizable: ${message}`)
  }
}

function warnSum(name: string, value: Pair) {
  const total = roundSize(value[0] + value[1])

  if (Math.abs(total - PERCENT_TOTAL) > 0.01) {
    warn(
      `${name} adds up to ${total}% instead of ${PERCENT_TOTAL}%; the panels keep the sizes they were given.`,
    )
  }
}

// The model is the caller's truth, so a value the group would rather correct is
// reported rather than rewritten: silently rewriting it would fight whatever
// writes it back.
watch(
  () => [props.modelValue, props.minSize, props.defaultValue],
  () => {
    if (!import.meta.env?.DEV) {
      return
    }

    const mins = toPair(props.minSize)

    if (props.minSize.length !== 2) {
      warnLength('min-size', props.minSize)
    }

    if (!isPercent(mins[0]) || !isPercent(mins[1])) {
      warn(`min-size values must be between 0 and ${PERCENT_TOTAL}, got [${mins.join(', ')}].`)
    } else if (mins[0] + mins[1] > PERCENT_TOTAL) {
      warn(
        `min-size [${mins.join(', ')}] adds up to more than ${PERCENT_TOTAL}%, so no split fits and the constraint is ignored.`,
      )
    }

    for (const [name, value] of [
      ['model-value', props.modelValue],
      ['default-value', props.defaultValue],
    ] as const) {
      if (isNil(value)) {
        continue
      }

      if (value.length !== 2) {
        warnLength(name, value)
        continue
      }

      warnSum(name, [value[0], value[1]])
    }

    const { min, max } = bounds.value
    const leading = sizes.value[0]

    if (leading < min || leading > max) {
      warn(
        `the leading panel sits at ${leading}%, outside its ${min}-${max}% range; it keeps that size until it is dragged.`,
      )
    }
  },
  { immediate: true, flush: 'post' },
)

const position = computed(() => sizes.value[0])
const ariaValueNow = computed(() => roundSize(position.value))
// A bare number is announced as "30" - no unit, and nothing about the fold.
// valuetext is the only place a separator can put either, since it has no
// aria-expanded to lean on.
const ariaValueText = computed(() =>
  collapsed.value ? `${ariaValueNow.value}%, folded` : `${ariaValueNow.value}%`,
)

function panelStyle(index: number) {
  return {
    flexBasis: `${sizes.value[index]}%`,
    flexGrow: 0,
    // The handle takes layout space of its own, so the row is always a little
    // wider than the panels. Shrinking spreads that remainder instead of
    // letting the container clip the last panel.
    flexShrink: 1,
  }
}

defineExpose({
  getPanelSizes: () => sizes.value.slice(),
  reset,
})
</script>

<template>
  <div
    ref="containerRef"
    :data-orientation="direction"
    class="pxd-resizable flex size-full max-w-full flex-row overflow-hidden data-[orientation=vertical]:flex-col"
    v-bind="$attrs"
  >
    <div
      :id="leadingId"
      class="pxd-resizable-panel min-w-0 min-h-0 overflow-hidden"
      :style="panelStyle(0)"
    >
      <slot name="leading" :size="sizes[0]" />
    </div>

    <!--
      A *focusable* separator is a widget, and only that flavour may carry
      aria-valuenow / aria-valuemin / aria-valuemax - which is why it takes a
      tabindex and the key handler below, not just a pointer drag. aria-expanded
      is not a separator state at any focusability: it marks control over
      visibility, and folding a panel never hides it. The fold therefore rides
      on aria-valuetext.
    -->
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
      class="pxd-resizable-handle relative shrink-0 touch-none bg-border self-focus-ring select-none hover:after:bg-primary/15 active:after:bg-primary/20 aria-disabled:cursor-default motion-safe:transition-colors after:motion-safe:transition-colors"
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
      <slot name="trailing" :size="sizes[1]" />
    </div>
  </div>
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
