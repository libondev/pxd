<script lang="ts" setup>
import type { SliderEmits, SliderProps } from './types'
import { computed, onBeforeUnmount, shallowRef } from 'vue'
import { useModelValue } from '../../composables/_internal/use-model-value'
import {
  createTailwindVariant,
  useTailwindVariant,
} from '../../composables/_internal/use-tailwind-variant'
import { useConfigProvider } from '../../contexts/config-provider'
import { cachedOff, cachedOn, once } from '../../utils/event'
import { NOOP, throttleByRaf } from '../../utils/event'
import { getFallbackValue } from '../../utils/helper'

defineOptions({
  name: 'PSlider',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

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

const VARIANTS = {
  primary: 'var(--color-primary)',
  success: 'hsl(var(--color-blue-700-value))',
  warning: 'hsl(var(--color-amber-700-value))',
  secondary: 'hsl(var(--color-gray-700-value))',
  error: 'hsl(var(--color-red-700-value))',
}

let isDragging = false
let sliderRect: DOMRect | null = null
let lastClientX: number | null = null
let lastUpdatedValue: number | [number, number] | null = null

const sliderRef = shallowRef<HTMLElement>()

const modelValue = useModelValue(props, emits, { withChange: false })

const activeThumb = shallowRef<'start' | 'end' | null>()

const computedThumbClasses = computed(() => {
  const base = {
    size: props.size || configProvider.size,
    disabled: props.disabled,
  }

  return {
    start: sliderThumbClasses({ ...base, appearance: 'none' }),
    end: sliderThumbClasses({ ...base, appearance: 'auto' }),
  }
})

const valueRange = computed<[number, number]>(() => {
  if (props.range) {
    return Array.isArray(modelValue.value)
      ? (modelValue.value as [number, number])
      : [props.min, modelValue.value as number]
  }
  return [props.min, modelValue.value as number]
})

function getPercentage(value: number) {
  const { min, max } = props
  const range = max - min
  return Math.max(0, Math.min(100, ((value - min) / range) * 100))
}

const startPercentage = computed(() => getPercentage(valueRange.value[0]))
const endPercentage = computed(() => getPercentage(valueRange.value[1]))

const trackStyle = computed(() => {
  const backgroundColor = props.disabled
    ? 'var(--color-gray-alpha-400)'
    : getFallbackValue(props.variant, VARIANTS, 'primary')

  if (props.range) {
    return {
      left: `${startPercentage.value}%`,
      width: `${endPercentage.value - startPercentage.value}%`,
      backgroundColor,
    }
  }

  return {
    width: `${endPercentage.value}%`,
    backgroundColor,
  }
})

function updateValueFromPosition(clientX: number) {
  if (!sliderRef.value || !activeThumb.value) {
    return
  }

  const rect = sliderRect ?? sliderRef.value.getBoundingClientRect()

  // position percentage
  const posPercentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))

  const range = props.max - props.min
  const rawValue = props.min + posPercentage * range

  const newValue = Math.max(
    props.min,
    Math.min(props.max, props.step > 0 ? Math.round(rawValue / props.step) * props.step : rawValue),
  )

  if (props.range) {
    const newValueArray = [...valueRange.value] as [number, number]

    if (activeThumb.value === 'start') {
      newValueArray[0] = newValue

      if (newValue > newValueArray[1]) {
        ;[newValueArray[0], newValueArray[1]] = [newValueArray[1], newValueArray[0]]
        activeThumb.value = 'end'
      }
    } else {
      newValueArray[1] = newValue

      if (newValue < newValueArray[0]) {
        ;[newValueArray[0], newValueArray[1]] = [newValueArray[1], newValueArray[0]]
        activeThumb.value = 'start'
      }
    }

    if (valueRange.value[0] !== newValueArray[0] || valueRange.value[1] !== newValueArray[1]) {
      lastUpdatedValue = newValueArray
      modelValue.value = newValueArray
    }
  } else if (modelValue.value !== newValue) {
    lastUpdatedValue = newValue
    modelValue.value = newValue
  }
}

const scheduleUpdate = throttleByRaf(() => {
  if (lastClientX !== null) {
    updateValueFromPosition(lastClientX)
  }
})

function startDragging(ev: PointerEvent, thumb: 'start' | 'end') {
  if (!sliderRef.value) {
    return
  }

  sliderRect = sliderRef.value.getBoundingClientRect()
  isDragging = true
  activeThumb.value = thumb
  lastClientX = ev.clientX

  updateValueFromPosition(ev.clientX)

  once(document, 'pointerup', endDragging)
  once(document, 'pointercancel', cancelDragging)
  cachedOn(document, 'pointermove', handleMove, { passive: false })
}

function handleMove(ev: PointerEvent) {
  if (!isDragging || props.disabled) {
    return
  }

  ev.preventDefault()
  lastClientX = ev.clientX
  scheduleUpdate()
}

function resetDragging() {
  isDragging = false
  lastClientX = null
  sliderRect = null
  activeThumb.value = null
  lastUpdatedValue = null

  scheduleUpdate.cancel()

  cachedOff(document, 'pointermove', handleMove)
  document.removeEventListener('pointerup', endDragging)
  document.removeEventListener('pointercancel', cancelDragging)
}

function endDragging(ev: PointerEvent) {
  updateValueFromPosition(ev.clientX)

  if (lastUpdatedValue !== null) {
    emits('change', lastUpdatedValue)
  }

  resetDragging()
}

function cancelDragging() {
  resetDragging()
}

function handleSliderClick(ev: PointerEvent) {
  if (isDragging || !props.range || props.disabled) {
    return
  }

  const rect = sliderRef.value?.getBoundingClientRect()
  if (!rect) {
    return
  }

  const clickPosition = (ev.clientX - rect.left) / rect.width
  const startPos = startPercentage.value / 100
  const endPos = endPercentage.value / 100

  // use the closest thumb
  const thumb =
    Math.abs(clickPosition - startPos) < Math.abs(clickPosition - endPos) ? 'start' : 'end'

  startDragging(ev, thumb)
}

function onWrapperPointerdown(ev: PointerEvent) {
  if (props.disabled) {
    return
  }

  if (props.range) {
    handleSliderClick(ev)
    return
  }

  startDragging(ev, 'end')
}

function initModelValue() {
  if (props.range && !Array.isArray(modelValue.value)) {
    modelValue.value = [props.min, modelValue.value as number]
  } else if (!props.range && Array.isArray(modelValue.value)) {
    modelValue.value = modelValue.value[1] ?? 0
  }
}

function onThumbKeydown(ev: KeyboardEvent) {
  if (props.disabled) {
    return
  }

  const { code } = ev
  const delta = code === 'ArrowLeft' ? -props.step : code === 'ArrowRight' ? props.step : 0

  if (!delta) {
    return
  }

  ev.preventDefault()

  const target = ev.target as HTMLElement

  const isStart = target.dataset.rangeStart === 'true'

  if (props.range) {
    const [startVal, endVal] = valueRange.value
    const newRange: [number, number] = [startVal, endVal]

    if (isStart) {
      newRange[0] = Math.max(props.min, Math.min(endVal, startVal + delta))
    } else {
      newRange[1] = Math.max(startVal, Math.min(props.max, endVal + delta))
    }

    if (newRange[0] !== startVal || newRange[1] !== endVal) {
      modelValue.value = newRange
      emits('change', newRange)
    }
  } else {
    const current = modelValue.value as number
    const newValue = Math.max(props.min, Math.min(props.max, current + delta))

    if (newValue !== current) {
      modelValue.value = newValue
      emits('change', newValue)
    }
  }
}

initModelValue()

onBeforeUnmount(() => {
  scheduleUpdate.cancel()

  cachedOff(document, 'pointermove', handleMove)
  document.removeEventListener('pointerup', endDragging)
  document.removeEventListener('pointercancel', cancelDragging)
})
</script>

<template>
  <div
    v-bind="attrs"
    ref="sliderRef"
    :role="range ? 'group' : 'slider'"
    :class="classes"
    :data-variant="variant"
    @pointerdown.prevent="onWrapperPointerdown"
  >
    <div class="pxd-slider--track absolute h-full touch-none rounded-full" :style="trackStyle" />

    <div
      v-if="props.range"
      tabindex="0"
      :data-dragging="isDragging && activeThumb === 'start'"
      :data-range-start="true"
      :class="computedThumbClasses.start"
      :style="{ left: `${startPercentage}%` }"
      @keydown="onThumbKeydown"
      @contextmenu.prevent="NOOP"
      @pointerdown.prevent.stop="startDragging($event, 'start')"
    >
      <span
        class="py-1 px-1 text-xs -top-6 shadow-lg pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-md border border-gray-900 bg-gray-1000 leading-none whitespace-nowrap text-gray-100 tabular-nums opacity-0 select-none text-trim-both group-hover:opacity-100 group-data-[dragging=true]:opacity-100 motion-safe:transition-opacity"
      >
        {{ valueRange[0] }}
      </span>
    </div>

    <div
      tabindex="0"
      :data-range-start="range ? false : true"
      :data-dragging="isDragging && activeThumb === 'end'"
      :class="computedThumbClasses.end"
      :style="{ left: `${endPercentage}%` }"
      @keydown="onThumbKeydown"
      @contextmenu.prevent="NOOP"
      @pointerdown.prevent.stop="startDragging($event, 'end')"
    >
      <span
        class="py-1 px-1 text-xs -top-6 shadow-lg pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-md border border-gray-900 bg-gray-1000 leading-none whitespace-nowrap text-gray-100 tabular-nums opacity-0 select-none text-trim-both group-hover:opacity-100 group-data-[dragging=true]:opacity-100 motion-safe:transition-opacity"
      >
        {{ valueRange[1] }}
      </span>
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
