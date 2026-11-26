<script lang="ts" setup>
import type { SliderEmits, SliderProps } from './types'
import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import { useAgentNode } from '../../composables/_internal/use-agent-node.js'
import { useFormControl } from '../../composables/_internal/use-form-control.js'
import { useModelCommit } from '../../composables/_internal/use-model-commit.js'
import {
  createTailwindVariant,
  useTailwindVariant,
} from '../../composables/_internal/use-tailwind-variant.js'
import { VARIANT_COLORS } from '../../constants/variant-colors.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { getLabelShift, getPercentage, getRelativePosition } from '../../utils/_internal/slider.js'
import { cachedOn, once, throttleByRaf } from '../../utils/event.js'
import { clampValue } from '../../utils/format.js'
import { getFallbackValue, getUniqueId } from '../../utils/helper.js'

type ThumbIndex = 0 | 1

defineOptions({
  name: 'PSlider',
  inheritAttrs: false,
})
const props = withDefaults(defineProps<SliderProps>(), {
  min: 0,
  max: 100,
  step: 1,
  variant: 'primary',
})

const emits = defineEmits<SliderEmits>()

const sliderThumbClasses = createTailwindVariant({
  base: 'pxd-slider--thumb group rounded-xs absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 touch-none bg-none self-focus-ring outline-none motion-safe:before:transition-appearance',
  variants: {
    size: {
      sm: 'w-1.5 h-3.5',
      md: 'w-2 h-4.5',
      lg: 'w-2.5 h-5',
    },
    disabled: {
      true: 'pointer-events-none',
    },
    appearance: {
      none: 'appearance-none',
      auto: 'appearance-auto',
    },
  },
})

const sliderMarkClasses = createTailwindVariant({
  base: 'pxd-slider--mark cursor-pointer absolute top-0 appearance-none rounded-xs bg-none p-0 font-inherit text-xs whitespace-nowrap leading-none select-none outline-none self-focus-ring motion-safe:transition-colors',
  variants: {
    align: {
      start: 'translate-x-0',
      center: '-translate-x-1/2',
      end: '-translate-x-full',
    },
    active: {
      true: 'text-primary',
      false: 'text-foreground-secondary enabled:hover:text-foreground',
    },
    disabled: {
      true: 'cursor-not-allowed',
    },
  },
})

const activeMarkClasses = sliderMarkClasses({ active: true })
const inactiveMarkClasses = sliderMarkClasses({ active: false })

let sliderRect: DOMRect | null = null
let lastClientX: number | null = null
let lastUpdatedValue: number | [number, number] | null = null
let stopMoveListener: (() => void) | null = null
const labelRefList = [shallowRef<HTMLElement>(), shallowRef<HTMLElement>()]
const scheduleUpdate = throttleByRaf(() => {
  if (lastClientX !== null) {
    updateValueFromPosition(lastClientX)
  }
})

const sliderRef = shallowRef<HTMLElement>()
const activeThumb = shallowRef<ThumbIndex | null>(null)
const sliderWidth = shallowRef(0)
const labelWidthList = shallowRef<[number, number]>([0, 0])
const stepValues = computed<number[]>(() => {
  const { step, min, max } = props

  if (!Array.isArray(step)) {
    return []
  }

  return step.toSorted((a, b) => a - b).filter((value) => value >= min && value <= max)
})
const stopList = computed(() => {
  const { stops, min, max, step } = props

  if (!stops || max <= min) {
    return []
  }

  const values = Array.isArray(step) ? stepValues.value : getNumericStepValues(min, max, step)

  // Only the interior steps get a dot: the track edges already say where min
  // and max are, and a dot there has nowhere to sit without hanging off the track.
  return values
    .map((value) => ({ value, percentage: getPercentage(value, props.min, props.max) }))
    .filter((stop) => stop.percentage > 0 && stop.percentage < 100)
})

const markList = computed(() => {
  const { marks, min, max, disabled } = props

  if (!marks) {
    return []
  }

  const entries = Object.keys(marks)
    .map((key) => {
      const value = Number(key)

      return { value, label: marks[value] }
    })
    .filter((mark) => mark.value >= min && mark.value <= max)

  return entries.map((mark, index) => ({
    value: mark.value,
    label: mark.label,
    percentage: getPercentage(mark.value, props.min, props.max),
    // The outermost labels are pinned to the track edges. Anchoring on
    // value === min/max instead left every other mark centred, so a label near
    // an end hung off the track.
    classes: sliderMarkClasses({
      align:
        entries.length < 2
          ? 'center'
          : index === 0
            ? 'start'
            : index === entries.length - 1
              ? 'end'
              : 'center',
      disabled,
    }),
  }))
})

// Uncontrolled fallback: a bound `modelValue` always wins.
const { modelValue: activeValue, commit } = useModelCommit(props, emits, {
  defaultValue: () => props.defaultValue ?? (props.range ? [props.min, props.min] : props.min),
})

// Outside range mode the start slot is pinned to `min`, so both modes share one pair and
// only the emitted payload differs.
const valueRange = computed<[number, number]>(() => {
  const value = activeValue.value

  if (props.range) {
    return Array.isArray(value) ? (value as [number, number]) : [props.min, value as number]
  }

  return [props.min, Array.isArray(value) ? (value[1] ?? 0) : (value as number)]
})
const startPercentage = computed(() => getPercentage(valueRange.value[0], props.min, props.max))
const endPercentage = computed(() => getPercentage(valueRange.value[1], props.min, props.max))
const labelShiftList = computed(() => [
  getLabelShift(startPercentage.value, labelWidthList.value[0], sliderWidth.value),
  getLabelShift(endPercentage.value, labelWidthList.value[1], sliderWidth.value),
])
const trackStyle = computed(() => ({
  left: `${startPercentage.value}%`,
  width: `${endPercentage.value - startPercentage.value}%`,
  backgroundColor: props.disabled
    ? 'var(--color-gray-alpha-400)'
    : getFallbackValue(props.variant, VARIANT_COLORS, 'primary'),
}))

const configProvider = useConfigProvider()

const thumbList = computed(() => {
  const base = {
    size: props.size || configProvider.size,
    disabled: props.disabled,
  }
  const [start, end] = valueRange.value
  const endThumb = {
    index: 1 as const,
    value: end,
    percentage: endPercentage.value,
    appearance: 'auto' as const,
  }
  const thumbs = props.range
    ? [
        {
          index: 0 as const,
          value: start,
          percentage: startPercentage.value,
          appearance: 'none' as const,
        },
        endThumb,
      ]
    : [endThumb]

  return thumbs.map((thumb) => ({
    ...thumb,
    classes: sliderThumbClasses({ ...base, appearance: thumb.appearance }),
  }))
})

const {
  id: controlId,
  invalid: isInvalid,
  required: isRequired,
  describedBy,
  labelId,
} = useFormControl({
  id: () => props.id,
  fallbackId: getUniqueId('p-slider'),
  invalid: () => props.invalid,
})
const { attrs, classes } = useTailwindVariant(
  {
    base: 'pxd-slider--wrapper group/slider @container relative flex w-full max-w-full shrink-0 touch-none items-center rounded-full bg-gray-200 select-none',
    variants: {
      size: {
        sm: 'h-2',
        md: 'h-2.5',
        lg: 'h-3.5',
      },
      disabled: {
        true: 'cursor-not-allowed',
      },
    },
  },
  {
    selection: () => ({
      size: props.size || configProvider.size,
      disabled: props.disabled,
    }),
  },
)

useAgentNode({
  name: 'slider',
  state: () => ({
    value: activeValue.value ?? props.min,
    min: props.min,
    max: props.max,
    disabled: props.disabled ?? false,
  }),
  actions: {
    setValue: (value) => {
      const next = [...valueRange.value] as [number, number]

      if (props.range && Array.isArray(value)) {
        next[0] = toValidValue(Number(value[0]))
        next[1] = toValidValue(Number(value[1]))
      } else {
        next[1] = toValidValue(Number(Array.isArray(value) ? value[1] : value))
      }

      if (next[0] > next[1]) {
        next.reverse()
      }

      commit(setValue(next), { reason: 'api' })
    },
  },
})

function setValue(range: [number, number]) {
  const value = props.range ? range : range[1]

  activeValue.value = value

  return value
}

function getNumericStepValues(min: number, max: number, step: number) {
  if (step <= 0) {
    return []
  }

  // Only the values the drag/keyboard snapping can actually reach are stoppable.
  const count = Math.floor((max - min) / step)

  return Array.from({ length: count + 1 }, (_, index) => min + index * step)
}
function toValidValue(value: number) {
  if (!Array.isArray(props.step)) {
    const offset = value - props.min

    return clampValue(
      props.step > 0 ? Math.round(offset / props.step) * props.step + props.min : value,
      props.min,
      props.max,
    )
  }

  if (!stepValues.value.length) {
    return props.min
  }

  // Ties resolve to the lower value because the list is sorted ascending.
  return stepValues.value.reduce((closest, stepValue) =>
    Math.abs(stepValue - value) < Math.abs(closest - value) ? stepValue : closest,
  )
}

function toKeyboardValue(current: number, isNegative: boolean) {
  if (!Array.isArray(props.step)) {
    return isNegative ? current - props.step : current + props.step
  }

  const values = stepValues.value

  if (!values.length) {
    return props.min
  }

  const index = values.indexOf(current)

  if (index !== -1) {
    return values[Math.min(Math.max(index + (isNegative ? -1 : 1), 0), values.length - 1)]
  }

  // The current value is off-grid: jump to the closest allowed value in the pressed direction.
  const candidates = isNegative ? values.toReversed() : values

  return candidates.find((value) => (isNegative ? value < current : value > current)) ?? current
}
function setLabelRef(index: ThumbIndex, el: unknown) {
  labelRefList[index].value = el instanceof HTMLElement ? el : undefined
}

function measureLabels() {
  // Layout pixels: `getBoundingClientRect()` reports the box already scaled by an ancestor
  // zoom or transform, while the shift below is applied in unscaled pixels.
  sliderWidth.value = sliderRef.value?.clientWidth ?? 0
  labelWidthList.value = [
    labelRefList[0].value?.offsetWidth ?? 0,
    labelRefList[1].value?.offsetWidth ?? 0,
  ]
}

function updateValueFromPosition(clientX: number) {
  const index = activeThumb.value

  if (!sliderRef.value || index === null) {
    return
  }

  const rect = sliderRect ?? sliderRef.value.getBoundingClientRect()
  const position = getRelativePosition(clientX, rect)
  const next = [...valueRange.value] as [number, number]

  next[index] = toValidValue(props.min + position * (props.max - props.min))

  // Dragging a thumb past its neighbour hands the drag over instead of clamping.
  if (next[0] > next[1]) {
    next.reverse()
    activeThumb.value = index === 0 ? 1 : 0
  }

  if (next[0] !== valueRange.value[0] || next[1] !== valueRange.value[1]) {
    lastUpdatedValue = setValue(next)
  }
}
function handleMove(ev: PointerEvent) {
  if (activeThumb.value === null || props.disabled) {
    return
  }

  ev.preventDefault()
  lastClientX = ev.clientX
  scheduleUpdate()
}

function startDragging(ev: PointerEvent, index: ThumbIndex) {
  if (!sliderRef.value || props.disabled || activeThumb.value !== null) {
    return
  }

  sliderRect = sliderRef.value.getBoundingClientRect()
  activeThumb.value = index
  lastClientX = ev.clientX

  updateValueFromPosition(ev.clientX)

  once(document, 'pointerup', endDragging)
  once(document, 'pointercancel', stopDragging)
  stopMoveListener = cachedOn(document, 'pointermove', handleMove, { passive: false })
}

function stopDragging() {
  activeThumb.value = null
  sliderRect = null
  lastClientX = null
  lastUpdatedValue = null

  scheduleUpdate.cancel()
  stopMoveListener?.()
  stopMoveListener = null
  document.removeEventListener('pointerup', endDragging)
  document.removeEventListener('pointercancel', stopDragging)
}

function endDragging(ev: PointerEvent) {
  updateValueFromPosition(ev.clientX)

  if (lastUpdatedValue !== null) {
    commit(lastUpdatedValue, { reason: 'settle', event: ev })
  }

  stopDragging()
}

function nearestThumbIndex(clientX: number): ThumbIndex {
  const rect = sliderRef.value?.getBoundingClientRect()
  const position = rect ? (clientX - rect.left) / rect.width : 0

  return Math.abs(position - startPercentage.value / 100) <
    Math.abs(position - endPercentage.value / 100)
    ? 0
    : 1
}

function onTrackPointerdown(ev: PointerEvent) {
  startDragging(ev, props.range ? nearestThumbIndex(ev.clientX) : 1)
}

function isSameValue(a: unknown, b: unknown) {
  return Array.isArray(a) && Array.isArray(b)
    ? a.length === b.length && a.every((value, index) => value === b[index])
    : a === b
}

function initModelValue() {
  const [start, end] = valueRange.value
  // An array step spells out the allowed values, so an off-list value is corrected on mount
  // instead of lingering until the first interaction.
  const snapped = (
    Array.isArray(props.step)
      ? [toValidValue(start), toValidValue(end)].sort((a, b) => a - b)
      : [start, end]
  ) as [number, number]
  const value = props.range ? snapped : snapped[1]

  if (!isSameValue(activeValue.value, value)) {
    activeValue.value = value
  }
}

function onThumbKeydown(ev: KeyboardEvent, index: ThumbIndex) {
  if (props.disabled) {
    return
  }

  const { code } = ev
  const isNegative = code === 'ArrowLeft' || code === 'ArrowDown'
  const isPositive = code === 'ArrowRight' || code === 'ArrowUp'
  const isToMin = code === 'Home'
  const isToMax = code === 'End'

  if (!isNegative && !isPositive && !isToMin && !isToMax) {
    return
  }

  ev.preventDefault()

  const lower = index === 0 ? props.min : valueRange.value[0]
  const upper = index === 0 ? valueRange.value[1] : props.max
  const next = [...valueRange.value] as [number, number]
  // A thumb never crosses the other one; outside range mode the start slot is pinned to
  // `min`, which leaves the full [min, max] span.
  next[index] = clampValue(
    isToMin ? lower : isToMax ? upper : toKeyboardValue(next[index], isNegative),
    lower,
    upper,
  )

  if (next[index] === valueRange.value[index]) {
    return
  }

  commit(setValue(next), { reason: 'settle' })
}

function selectMark(value: number) {
  if (props.disabled) {
    return
  }

  const next = [...valueRange.value] as [number, number]
  // Move the thumb the mark sits closest to, matching a click on the track.
  const index = props.range && Math.abs(value - next[0]) < Math.abs(value - next[1]) ? 0 : 1

  next[index] = value

  if (next[index] === valueRange.value[index]) {
    return
  }

  commit(setValue(next), { reason: 'item-press' })
}

watch(
  [() => String(thumbList.value[0]?.value ?? ''), () => String(thumbList.value[1]?.value ?? '')],
  (values, previous) => {
    if (values[0].length === previous?.[0]?.length && values[1].length === previous?.[1]?.length) {
      return
    }

    measureLabels()
  },
  { flush: 'post' },
)

initModelValue()

onMounted(measureLabels)

onBeforeUnmount(stopDragging)
</script>

<template>
  <div
    data-slider
    v-bind="attrs"
    :id="controlId"
    :data-variant="variant"
    class="pxd-slider w-full max-w-full shrink-0"
  >
    <div
      ref="sliderRef"
      :role="range ? 'group' : undefined"
      :class="classes"
      @pointerdown.prevent="onTrackPointerdown"
    >
      <div class="pxd-slider--track absolute h-full touch-none rounded-full" :style="trackStyle" />

      <span
        v-for="stop in stopList"
        :key="stop.value"
        class="pxd-slider--stop size-1 pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-alpha-200"
        :style="{ left: `${stop.percentage}%` }"
      />

      <div
        v-for="thumb in thumbList"
        :key="thumb.index"
        class="pxd-slider--thumb-anchor left-0 h-0 w-0 absolute top-1/2"
        :class="{ 'z-1': activeThumb === thumb.index }"
        :style="{ translate: `${thumb.percentage}cqw 0` }"
      >
        <div
          role="slider"
          tabindex="0"
          :aria-valuemin="thumb.index === 0 ? min : valueRange[0]"
          :aria-valuemax="thumb.index === 0 ? valueRange[1] : max"
          :aria-valuenow="thumb.value"
          aria-orientation="horizontal"
          :aria-disabled="disabled"
          :aria-invalid="isInvalid || undefined"
          :aria-required="isRequired || undefined"
          :aria-describedby="describedBy || undefined"
          :aria-labelledby="labelId || undefined"
          :data-dragging="activeThumb === thumb.index"
          :class="thumb.classes"
          @keydown="onThumbKeydown($event, thumb.index)"
          @contextmenu.prevent
          @pointerdown.prevent.stop="startDragging($event, thumb.index)"
          @pointerenter="measureLabels"
        >
          <span
            :ref="(el: unknown) => setLabelRef(thumb.index, el)"
            class="pxd-slider--label py-1 px-1 text-xs -top-7 shadow-xl pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-sm border border-gray-alpha-300 bg-gray-1000 leading-none whitespace-nowrap text-gray-100 tabular-nums opacity-0 select-none group-hover:opacity-100 group-data-[dragging=true]:opacity-100 motion-safe:transition-opacity"
            :style="{ translate: `calc(-50% + ${labelShiftList[thumb.index]}px)` }"
          >
            {{ thumb.value }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="markList.length" class="mbs-2 h-3 relative">
      <button
        v-for="mark in markList"
        :key="mark.value"
        type="button"
        tabindex="-1"
        :disabled="disabled"
        :class="[
          mark.classes,
          mark.value <= valueRange[1] ? activeMarkClasses : inactiveMarkClasses,
        ]"
        :style="{ left: `${mark.percentage}%` }"
        @click="selectMark(mark.value)"
      >
        {{ mark.label }}
      </button>
    </div>
  </div>
</template>

<style lang="postcss">
.pxd-slider--thumb {
  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    border-radius: inherit;
    transform: translate3d(-50%, -50%, 0) scale(var(--slider-thumb-scale, 1));
  }

  &::before {
    width: 100%;
    height: 100%;
    background-color: #fff;
    box-shadow:
      0 0 0 1px var(--color-gray-alpha-500),
      0 1px 2px var(--color-gray-alpha-100);
  }

  &::after {
    width: 150%;
    height: 150%;
  }

  &[data-dragging='true'] {
    --slider-thumb-scale: 1.3;

    &::after {
      width: 100%;
      height: 100%;
    }
  }
}

.dark .pxd-slider--thumb::before {
  box-shadow: 0 0 0 1px var(--color-background-200);
}

.pxd-slider--wrapper::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 180%;
  transform: translateY(-50%);
  background: transparent;
  z-index: 0;
}
</style>
