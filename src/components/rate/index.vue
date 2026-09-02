<script lang="ts" setup>
import type { RateEmits, RateProps } from './types'
import StarIcon from '@gdsicon/vue/star'
import StarFillIcon from '@gdsicon/vue/star-fill'
import { computed, onBeforeUnmount, shallowRef } from 'vue'
import { useModelValue } from '../../composables/_internal/use-model-value'
import { useTailwindVariant } from '../../composables/_internal/use-tailwind-variant'
import { useConfigProvider } from '../../contexts/config-provider'
import { cachedOff, cachedOn, throttleByRaf } from '../../utils/event'

defineOptions({
  name: 'PRate',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<RateProps>(), {
  count: 5,
  modelValue: 0,
  allowHalf: false,
  readonly: false,
  disabled: false,
  clearable: false,
})

const emits = defineEmits<RateEmits>()

const configProvider = useConfigProvider()
const modelValue = useModelValue(props, emits)

const { attrs, classes } = useTailwindVariant(
  {
    base: 'pxd-rate inline-flex cursor-pointer touch-none items-center rounded-sm self-focus-ring select-none',
    variants: {
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-xl',
      },
      disabled: {
        true: 'cursor-not-allowed',
      },
      readonly: {
        true: 'cursor-default',
      },
    },
  },
  {
    selection: () => {
      const { size, disabled, readonly } = props

      return {
        size: size || configProvider.size,
        disabled,
        readonly,
      }
    },
  },
)

const rateRef = shallowRef<HTMLElement>()
const hoverValue = shallowRef<number | null>(null)
const dragValue = shallowRef<number | null>(null)
const isDragging = shallowRef(false)

let activePointerId: number | null = null
let rateRect: DOMRect | null = null
let lastClientX: number | null = null

const displayValue = computed(() => dragValue.value ?? hoverValue.value ?? modelValue.value)

const starCount = computed(() => Math.max(1, props.count))

const fills = computed(() => {
  const value = displayValue.value
  const result: number[] = []
  for (let i = 0; i < starCount.value; i++) {
    if (i + 1 <= value) {
      result.push(1)
    } else if (props.allowHalf && i + 0.5 <= value) {
      result.push(0.5)
    } else {
      result.push(0)
    }
  }
  return result
})

function getValueFromPosition(clientX: number): number {
  if (!rateRef.value) {
    return 0
  }

  const rect = rateRect ?? rateRef.value.getBoundingClientRect()
  if (!rect.width) {
    return 0
  }

  const position = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  const rawValue = position * starCount.value
  const step = props.allowHalf ? 0.5 : 1

  return Math.max(step, Math.ceil(rawValue / step) * step)
}

function commitValue(value: number) {
  if (props.clearable && value === modelValue.value) {
    modelValue.value = 0
  } else {
    modelValue.value = value
  }
}

function resetDragging() {
  isDragging.value = false
  activePointerId = null
  rateRect = null
  lastClientX = null
  dragValue.value = null

  scheduleDragUpdate.cancel()

  cachedOff(document, 'pointermove', handleDocumentPointerMove, { passive: false })
  cachedOff(document, 'pointerup', handleDocumentPointerUp)
  cachedOff(document, 'pointercancel', handleDocumentPointerCancel)
}

function isActivePointer(event: PointerEvent) {
  return isDragging.value && event.pointerId === activePointerId
}

const scheduleDragUpdate = throttleByRaf(() => {
  if (lastClientX !== null) {
    dragValue.value = getValueFromPosition(lastClientX)
  }
})

function handlePointerDown(event: PointerEvent) {
  if (props.readonly || props.disabled || !rateRef.value) {
    return
  }

  isDragging.value = true
  activePointerId = event.pointerId
  rateRect = rateRef.value.getBoundingClientRect()
  lastClientX = event.clientX
  hoverValue.value = null
  dragValue.value = getValueFromPosition(event.clientX)

  cachedOn(document, 'pointermove', handleDocumentPointerMove, { passive: false })
  cachedOn(document, 'pointerup', handleDocumentPointerUp)
  cachedOn(document, 'pointercancel', handleDocumentPointerCancel)
}

function handleDocumentPointerMove(event: PointerEvent) {
  if (!isActivePointer(event)) {
    return
  }

  event.preventDefault()
  lastClientX = event.clientX
  scheduleDragUpdate()
}

function handleDocumentPointerUp(event: PointerEvent) {
  if (!isActivePointer(event)) {
    return
  }

  commitValue(getValueFromPosition(event.clientX))
  resetDragging()
}

function handleDocumentPointerCancel(event: PointerEvent) {
  if (!isActivePointer(event)) {
    return
  }

  resetDragging()
}

function handlePointerMove(event: PointerEvent) {
  if (props.readonly || props.disabled || isDragging.value || event.pointerType !== 'mouse') {
    return
  }

  hoverValue.value = getValueFromPosition(event.clientX)
}

function handlePointerLeave() {
  if (isDragging.value) {
    return
  }
  hoverValue.value = null
}

function handleKeydown(event: KeyboardEvent) {
  if (props.readonly || props.disabled) {
    return
  }
  const { key } = event
  const step = props.allowHalf ? 0.5 : 1
  if (key === 'ArrowRight' || key === 'ArrowUp') {
    event.preventDefault()
    modelValue.value = Math.min(starCount.value, modelValue.value + step)
  } else if (key === 'ArrowLeft' || key === 'ArrowDown') {
    event.preventDefault()
    modelValue.value = Math.max(0, modelValue.value - step)
  }
}

onBeforeUnmount(() => {
  resetDragging()
})
</script>

<template>
  <div
    ref="rateRef"
    role="radiogroup"
    tabindex="0"
    :class="classes"
    v-bind="attrs"
    @keydown="handleKeydown"
    @pointerdown.prevent="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerleave="handlePointerLeave"
  >
    <span
      v-for="i in starCount"
      :key="i"
      class="pxd-rate--item relative inline-flex"
      role="radio"
      :aria-checked="i <= modelValue"
      :aria-posinset="i"
      :aria-setsize="starCount"
      tabindex="-1"
    >
      <span
        class="pxd-rate--star-empty inline-flex text-gray-400 text-trim-both"
        :style="{ color: voidColor }"
      >
        <StarIcon />
      </span>

      <span
        class="pxd-rate--star-filled inset-0 absolute inline-flex text-trim-both"
        :class="disabled ? 'text-gray-500' : 'text-primary'"
        :style="{
          clipPath: `inset(0 ${(1 - fills[i - 1]) * 100}% 0 0)`,
          color: color,
        }"
      >
        <StarFillIcon />
      </span>
    </span>
  </div>
</template>
