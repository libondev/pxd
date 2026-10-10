<script lang="ts" setup>
import type { EffortSliderEmits, EffortSliderProps } from './types'
import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import { useModelValue } from '../../composables/_internal/use-model-value.js'
import {
  createTailwindVariant,
  useTailwindVariant,
} from '../../composables/_internal/use-tailwind-variant.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { cachedOn, off, once, throttleByRaf } from '../../utils/event.js'

defineOptions({
  name: 'PEffortSlider',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const PRIMARY_COLOR = 'var(--color-primary)'

function clamp(value: number, lower: number, upper: number) {
  return Math.min(Math.max(value, lower), upper)
}

const props = defineProps<EffortSliderProps>()

const emits = defineEmits<EffortSliderEmits>()

const configProvider = useConfigProvider()

const modelValue = useModelValue(props, emits, { withChange: false })

const { attrs, classes } = useTailwindVariant(
  {
    base: 'pxd-effort-slider--track group relative flex w-full max-w-full shrink-0 touch-none items-center rounded-full bg-gray-200 select-none',
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

const thumbClasses = createTailwindVariant({
  base: 'pxd-effort-slider--thumb group rounded-xs absolute -translate-x-1/2 transform-gpu touch-none bg-none self-focus-ring outline-none motion-safe:before:transition-appearance',
  variants: {
    size: {
      sm: 'w-1.5 h-3.5',
      md: 'w-2 h-4.5',
      lg: 'w-2.5 h-5',
    },
    disabled: {
      true: 'pointer-events-none',
    },
    dragging: {
      false: 'motion-safe:transition-[left]',
    },
  },
})

let trackRect: DOMRect | null = null
let lastClientX: number | null = null
let dragStartValue: string | number | null = null
let lastUpdatedValue: string | number | null = null
let stopMoveListener: (() => void) | null = null

const trackRef = shallowRef<HTMLElement>()
const thumbRef = shallowRef<HTMLElement>()
const labelRef = shallowRef<HTMLElement>()
const dragging = shallowRef(false)
const focused = shallowRef(false)
const dragPosition = shallowRef<number | null>(null)
const labelShift = shallowRef(0)

const optionList = computed(() =>
  props.options.map((option, index) =>
    typeof option === 'string'
      ? { label: option, value: option }
      : { label: option.label, value: option.value ?? index },
  ),
)

const levelCount = computed(() => optionList.value.length)

const currentIndex = computed(() => {
  const index = optionList.value.findIndex((option) => option.value === modelValue.value)

  return index === -1 ? 0 : index
})

const currentOptionLabel = computed(() => optionList.value[currentIndex.value]?.label as string)

const percentage = computed(() => {
  const count = levelCount.value
  const position = dragPosition.value

  // While dragging the thumb follows the pointer, otherwise it sits on its level.
  if (position !== null) {
    return position * 100
  }

  return count > 1 ? (currentIndex.value / (count - 1)) * 100 : 100
})

const labelVisible = computed(() => dragging.value || focused.value)

// The label stays centred on the thumb and is clamped against the thumb box instead of
// switching its alignment per level, so a label at either end lines up with the thumb edge.
function updateLabelShift() {
  const label = labelRef.value
  const thumb = thumbRef.value
  const track = trackRef.value

  if (!label || !thumb || !track) {
    return
  }

  const trackWidth = track.getBoundingClientRect().width
  const labelWidth = label.getBoundingClientRect().width
  const thumbWidth = thumb.getBoundingClientRect().width

  if (!trackWidth || !thumbWidth || labelWidth > trackWidth) {
    labelShift.value = 0
    return
  }

  const center = (percentage.value / 100) * trackWidth
  const left = center - labelWidth / 2
  // The label may reach as far as the thumb box, so its edge lines up with the thumb at the ends.
  const lower = -thumbWidth / 2
  const upper = trackWidth + thumbWidth / 2 - labelWidth

  labelShift.value = clamp(left, lower, Math.max(lower, upper)) - left
}

const tickList = computed(() => {
  const count = levelCount.value

  return Array.from({ length: Math.max(0, count - 2) }, (_, index) => {
    const level = index + 1

    return { level, percentage: (level / (count - 1)) * 100 }
  })
})

const fillStyle = computed(() => {
  const colors = props.colors

  let color = PRIMARY_COLOR

  for (let level = currentIndex.value; colors && level >= 0; level--) {
    const candidate = colors[String(level)]

    if (candidate) {
      color = candidate
      break
    }
  }

  return {
    width: `${percentage.value}%`,
    background: color,
  }
})

function setValue(index: number) {
  const option = optionList.value[index]

  if (!option) {
    return null
  }

  if (option.value !== modelValue.value) {
    modelValue.value = option.value
  }

  return option.value
}

function relativePosition(clientX: number) {
  const rect = trackRect ?? trackRef.value?.getBoundingClientRect()

  if (!rect || !rect.width) {
    return null
  }

  return clamp((clientX - rect.left) / rect.width, 0, 1)
}

function nearestIndex(clientX: number) {
  const position = relativePosition(clientX)
  const count = levelCount.value

  if (position === null || count === 0) {
    return currentIndex.value
  }

  const raw = position * (count - 1)
  const lower = Math.floor(raw)

  return clamp(raw - lower > 0.5 ? lower + 1 : lower, 0, count - 1)
}

function updateFromPosition(clientX: number) {
  const index = nearestIndex(clientX)

  if (index === currentIndex.value) {
    return
  }

  // A controlled parent may hold the value back, so the settle check compares against
  // what this drag emitted, not against `modelValue`.
  lastUpdatedValue = setValue(index)
}

const scheduleUpdate = throttleByRaf(() => {
  if (lastClientX !== null) {
    updateFromPosition(lastClientX)
  }
})

function onTrackPointerdown(ev: PointerEvent) {
  if (props.disabled || dragging.value) {
    return
  }

  trackRect = trackRef.value?.getBoundingClientRect() ?? null
  dragStartValue = modelValue.value ?? null
  lastUpdatedValue = null
  lastClientX = ev.clientX
  dragging.value = true
  dragPosition.value = relativePosition(ev.clientX)

  updateFromPosition(ev.clientX)

  stopMoveListener = cachedOn(document, 'pointermove', handleMove, { passive: false })
  once(document, 'pointerup', endDragging)
  once(document, 'pointercancel', stopDragging)
}

function onThumbKeydown(ev: KeyboardEvent) {
  if (props.disabled) {
    return
  }

  const { code } = ev
  const count = levelCount.value

  let index = currentIndex.value

  if (code === 'ArrowLeft' || code === 'ArrowDown') {
    index -= 1
  } else if (code === 'ArrowRight' || code === 'ArrowUp') {
    index += 1
  } else if (code === 'Home') {
    index = 0
  } else if (code === 'End') {
    index = count - 1
  } else {
    return
  }

  ev.preventDefault()

  const next = clamp(index, 0, count - 1)

  if (next === currentIndex.value) {
    return
  }

  const value = setValue(next)

  if (value !== null) {
    emits('change', value)
  }
}

function handleMove(ev: PointerEvent) {
  if (!dragging.value || props.disabled) {
    return
  }

  ev.preventDefault()
  lastClientX = ev.clientX
  dragPosition.value = relativePosition(ev.clientX)
  scheduleUpdate()
}

function endDragging(ev: PointerEvent) {
  lastClientX = ev.clientX

  updateFromPosition(ev.clientX)

  if (lastUpdatedValue !== null && lastUpdatedValue !== dragStartValue) {
    emits('change', lastUpdatedValue)
  }

  stopDragging()
}

function stopDragging() {
  dragging.value = false
  dragPosition.value = null
  trackRect = null
  lastClientX = null
  dragStartValue = null
  lastUpdatedValue = null

  scheduleUpdate.cancel()
  stopMoveListener?.()
  stopMoveListener = null
  off(document, 'pointerup', endDragging)
  off(document, 'pointercancel', stopDragging)
}

function initModelValue() {
  const option = optionList.value[0]

  if (!option) {
    return
  }

  const isValid = optionList.value.some((item) => item.value === props.modelValue)

  if (!isValid) {
    modelValue.value = option.value
  }
}

watch(() => [percentage.value, currentOptionLabel.value, labelVisible.value], updateLabelShift, {
  flush: 'post',
})

initModelValue()

onMounted(() => {
  updateLabelShift()
})

onBeforeUnmount(() => {
  stopDragging()
})
</script>

<template>
  <div v-bind="attrs" class="pxd-effort-slider w-full max-w-full shrink-0">
    <div
      ref="trackRef"
      :class="classes"
      :aria-disabled="disabled"
      @pointerdown.prevent="onTrackPointerdown"
    >
      <div
        class="pxd-effort-slider--fill inset-y-0 left-0 pointer-events-none absolute rounded-full motion-safe:transition-[width,background]"
        :class="{ 'motion-safe:transition-colors': dragging || focused }"
        :style="fillStyle"
      />

      <span
        v-for="tick in tickList"
        :key="tick.level"
        class="pxd-effort-slider--tick size-1 pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-500"
        :style="{ left: `${tick.percentage}%` }"
      />

      <div
        ref="thumbRef"
        role="slider"
        :tabindex="disabled ? -1 : 0"
        :aria-valuemin="0"
        :aria-valuemax="levelCount - 1"
        :aria-valuenow="currentIndex"
        :aria-valuetext="currentOptionLabel"
        :data-dragging="dragging"
        :class="thumbClasses({ size: size || configProvider.size, disabled, dragging })"
        :style="{ left: `${percentage}%` }"
        @keydown="onThumbKeydown"
        @focus="focused = true"
        @blur="focused = false"
        @contextmenu.prevent
      >
        <span
          ref="labelRef"
          class="pxd-effort-slider--label py-1 px-1 text-xs -top-6 shadow-xl pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-sm border border-gray-alpha-300 bg-gray-1000 leading-none whitespace-nowrap text-gray-100 tabular-nums opacity-0 select-none text-trim-both group-hover:opacity-100 group-data-[dragging=true]:opacity-100 motion-safe:transition-opacity"
          :class="{ 'opacity-100': dragging || focused }"
          :style="{ translate: `calc(-50% + ${labelShift}px)` }"
        >
          {{ currentOptionLabel }}
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="postcss">
.pxd-effort-slider--thumb {
  &:hover,
  &:active,
  &[data-dragging='true'] {
    --slider-thumb-scale: 1.3;
    z-index: 1;
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

.dark .pxd-effort-slider--thumb::before {
  box-shadow: 0 0 0 1px var(--color-background-200);
}
</style>
