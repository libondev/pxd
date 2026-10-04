<script lang="ts" setup>
import type { SliderEmits, SliderProps } from './types'
import { computed, onBeforeUnmount, shallowRef } from 'vue'
import { useModelValue } from '../../composables/_internal/use-model-value.js'
import {
  createTailwindVariant,
  useTailwindVariant,
} from '../../composables/_internal/use-tailwind-variant.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { cachedOn, once, throttleByRaf } from '../../utils/event.js'
import { getFallbackValue } from '../../utils/helper.js'

defineOptions({
  name: 'PSlider',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

type ThumbIndex = 0 | 1

function clamp(value: number, lower: number, upper: number) {
  return Math.min(Math.max(value, lower), upper)
}

const props = withDefaults(defineProps<SliderProps>(), {
  min: 0,
  max: 100,
  step: 1,
  modelValue: 0,
  variant: 'primary',
})

const emits = defineEmits<SliderEmits>()

const configProvider = useConfigProvider()

const { attrs, classes } = useTailwindVariant(
  {
    base: 'pxd-slider group/slider relative flex w-full max-w-full shrink-0 touch-none items-center rounded-full bg-gray-200 select-none',
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

const sliderThumbClasses = createTailwindVariant({
  base: 'pxd-slider--thumb group rounded-xs absolute -translate-x-1/2 transform-gpu touch-none bg-none self-focus-ring outline-none hover:z-1 active:[--slider-thumb-scale:1.3] motion-safe:before:transition-appearance pointer-fine:hover:[--slider-thumb-scale:1.3]',
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

const sliderStopClasses = createTailwindVariant({
  base: 'pxd-slider--stop pointer-events-none absolute top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full',
  variants: {
    filled: {
      true: 'bg-background-100/70',
      false: 'bg-gray-600/50',
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

const VARIANTS = {
  primary: 'var(--color-primary)',
  success: 'hsl(var(--color-blue-700-value))',
  warning: 'hsl(var(--color-amber-700-value))',
  secondary: 'hsl(var(--color-gray-700-value))',
  error: 'hsl(var(--color-red-700-value))',
}

const filledStopClasses = sliderStopClasses({ filled: true })
const unfilledStopClasses = sliderStopClasses({ filled: false })
const activeMarkClasses = sliderMarkClasses({ active: true })
const inactiveMarkClasses = sliderMarkClasses({ active: false })

let sliderRect: DOMRect | null = null
let lastClientX: number | null = null
let lastUpdatedValue: number | [number, number] | null = null
let stopMoveListener: (() => void) | null = null

const sliderRef = shallowRef<HTMLElement>()
const activeThumb = shallowRef<ThumbIndex | null>(null)

const modelValue = useModelValue(props, emits, { withChange: false })

// Outside range mode the start slot is pinned to `min`, so both modes share one pair and
// only the emitted payload differs.
const valueRange = computed<[number, number]>(() => {
  const value = modelValue.value

  if (props.range) {
    return Array.isArray(value) ? (value as [number, number]) : [props.min, value as number]
  }

  return [props.min, Array.isArray(value) ? (value[1] ?? 0) : (value as number)]
})

function setValue(range: [number, number]) {
  const value = props.range ? range : range[1]

  modelValue.value = value

  return value
}

function getPercentage(value: number) {
  return clamp(((value - props.min) / (props.max - props.min)) * 100, 0, 100)
}

function getNumericStepValues(min: number, max: number, step: number) {
  if (step <= 0) {
    return []
  }

  // Only the values the drag/keyboard snapping can actually reach are stoppable.
  const count = Math.floor((max - min) / step)

  return Array.from({ length: count + 1 }, (_, index) => min + index * step)
}

const stepValues = computed<number[]>(() => {
  const { step, min, max } = props

  if (!Array.isArray(step)) {
    return []
  }

  return [...step].sort((a, b) => a - b).filter((value) => value >= min && value <= max)
})

function toValidValue(value: number) {
  if (!Array.isArray(props.step)) {
    const offset = value - props.min

    return clamp(
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
  const candidates = isNegative ? values.slice().reverse() : values

  return candidates.find((value) => (isNegative ? value < current : value > current)) ?? current
}

const startPercentage = computed(() => getPercentage(valueRange.value[0]))
const endPercentage = computed(() => getPercentage(valueRange.value[1]))

const stopList = computed(() => {
  const { stops, min, max, step } = props

  if (!stops || max <= min) {
    return []
  }

  const values = Array.isArray(step) ? stepValues.value : getNumericStepValues(min, max, step)

  // Only the interior steps get a dot: the track edges already say where min
  // and max are, and a dot there has nowhere to sit without hanging off the track.
  return values
    .map((value) => ({ value, percentage: getPercentage(value) }))
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
    percentage: getPercentage(mark.value),
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

const trackStyle = computed(() => ({
  left: `${startPercentage.value}%`,
  width: `${endPercentage.value - startPercentage.value}%`,
  backgroundColor: props.disabled
    ? 'var(--color-gray-alpha-400)'
    : getFallbackValue(props.variant, VARIANTS, 'primary'),
}))

function isStopFilled(percentage: number) {
  return percentage >= startPercentage.value && percentage <= endPercentage.value
}

function updateValueFromPosition(clientX: number) {
  const index = activeThumb.value

  if (!sliderRef.value || index === null) {
    return
  }

  const rect = sliderRect ?? sliderRef.value.getBoundingClientRect()
  const position = clamp((clientX - rect.left) / rect.width, 0, 1)
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

const scheduleUpdate = throttleByRaf(() => {
  if (lastClientX !== null) {
    updateValueFromPosition(lastClientX)
  }
})

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
    emits('change', lastUpdatedValue)
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

  if (!isSameValue(modelValue.value, value)) {
    modelValue.value = value
  }
}

function onThumbKeydown(ev: KeyboardEvent, index: ThumbIndex) {
  if (props.disabled) {
    return
  }

  const { code } = ev
  const isNegative = code === 'ArrowLeft'

  if (!isNegative && code !== 'ArrowRight') {
    return
  }

  ev.preventDefault()

  const next = [...valueRange.value] as [number, number]
  // A thumb never crosses the other one; outside range mode the start slot is pinned to
  // `min`, which leaves the full [min, max] span.
  next[index] = clamp(
    toKeyboardValue(next[index], isNegative),
    index === 0 ? props.min : next[0],
    index === 0 ? next[1] : props.max,
  )

  if (next[index] === valueRange.value[index]) {
    return
  }

  emits('change', setValue(next))
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

  emits('change', setValue(next))
}

initModelValue()

onBeforeUnmount(stopDragging)
</script>

<template>
  <div
    v-bind="attrs"
    :data-variant="variant"
    class="pxd-slider--container w-full max-w-full shrink-0"
  >
    <div
      ref="sliderRef"
      :role="range ? 'group' : 'slider'"
      :class="classes"
      @pointerdown.prevent="onTrackPointerdown"
    >
      <div class="pxd-slider--track absolute h-full touch-none rounded-full" :style="trackStyle" />

      <span
        v-for="stop in stopList"
        :key="stop.value"
        :class="isStopFilled(stop.percentage) ? filledStopClasses : unfilledStopClasses"
        :style="{ left: `${stop.percentage}%` }"
      />

      <div
        v-for="thumb in thumbList"
        :key="thumb.index"
        tabindex="0"
        :data-dragging="activeThumb === thumb.index"
        :class="thumb.classes"
        :style="{ left: `${thumb.percentage}%` }"
        @keydown="onThumbKeydown($event, thumb.index)"
        @contextmenu.prevent
        @pointerdown.prevent.stop="startDragging($event, thumb.index)"
      >
        <span
          class="py-1 px-1 text-xs -top-6 shadow-lg pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-md border border-gray-900 bg-gray-1000 leading-none whitespace-nowrap text-gray-100 tabular-nums opacity-0 select-none text-trim-both group-hover:opacity-100 group-data-[dragging=true]:opacity-100 motion-safe:transition-opacity"
        >
          {{ thumb.value }}
        </span>
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
  &[data-dragging='true'] {
    --slider-thumb-scale: 1.3;
  }

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
    width: 200%;
    height: 200%;
  }
}

.dark .pxd-slider--thumb::before {
  box-shadow: 0 0 0 1px var(--color-background-200);
}
</style>
