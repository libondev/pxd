<script lang="ts" setup>
import type { ComponentSize, ComponentVariant } from '../../types/components'
import { computed, onBeforeUnmount, shallowRef } from 'vue'
import { useComputedSize } from '../../composables/useComputedSize'
import { useModelValue } from '../../composables/useModelValue'

interface Props {
  min?: number
  max?: number
  step?: number
  range?: boolean
  size?: ComponentSize
  variant?: ComponentVariant | 'secondary'
  modelValue?: number | [number, number]
}

defineOptions({
  name: 'PSlider',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    min: 0,
    max: 100,
    step: 1,
    modelValue: 0,
    variant: 'primary',
  },
)

const emits = defineEmits<{
  'update:modelValue': [Props['modelValue']]
}>()

const SIZES = {
  sm: {
    track: 'h-2',
    thumb: 'w-1.5 h-3.5',
  },
  md: {
    track: 'h-2.5',
    thumb: 'w-2 h-4.5',
  },
  lg: {
    track: 'h-3.5',
    thumb: 'w-2.5 h-5',
  },
}

const VARIANTS = {
  primary: 'var(--color-primary)',
  success: 'hsl(var(--blue-700-value))',
  warning: 'hsl(var(--amber-700-value))',
  secondary: 'hsl(var(--gray-700-value))',
  error: 'hsl(var(--red-700-value))',
}

let isDragging = false
let lastClientX: number | null
let animationFrameId: number | null
const activeThumb = shallowRef<'start' | 'end' | null>()

const sliderRef = shallowRef<HTMLElement>()

const modelValue = useModelValue(props, emits)

const computedSize = computed(() => useComputedSize(props.size, SIZES))

const valueArray = computed<[number, number]>(() => {
  if (props.range) {
    return Array.isArray(modelValue.value)
      ? modelValue.value as [number, number]
      : [props.min, modelValue.value as number]
  }
  return [props.min, modelValue.value as number]
})

function getPercentage(value: number) {
  const { min, max } = props
  const range = max - min
  return Math.max(0, Math.min(100, ((value - min) / range) * 100))
}

const startPercentage = computed(() => getPercentage(valueArray.value[0]))
const endPercentage = computed(() => getPercentage(valueArray.value[1]))

const trackStyle = computed(() => {
  if (props.range) {
    return {
      left: `${startPercentage.value}%`,
      width: `${endPercentage.value - startPercentage.value}%`,
      backgroundColor: VARIANTS[props.variant] || VARIANTS.primary,
    }
  }

  return {
    width: `${endPercentage.value}%`,
    backgroundColor: VARIANTS[props.variant] || VARIANTS.primary,
  }
})

function updateValueFromPosition(clientX: number) {
  if (!sliderRef.value || !activeThumb.value)
    return

  const rect = sliderRef.value.getBoundingClientRect()

  // 计算位置百分比
  const posPercentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))

  // 计算实际值
  const range = props.max - props.min
  const rawValue = props.min + posPercentage * range

  // 应用步进值和边界约束
  const newValue = Math.max(
    props.min,
    Math.min(
      props.max,
      props.step > 0 ? Math.round(rawValue / props.step) * props.step : rawValue,
    ),
  )

  if (props.range) {
    // 创建新的值数组
    const newValueArray = [...valueArray.value] as [number, number]

    // 根据活动滑块更新值
    if (activeThumb.value === 'start') {
      newValueArray[0] = newValue

      // 处理滑块交换
      if (newValue > newValueArray[1]) {
        [newValueArray[0], newValueArray[1]] = [newValueArray[1], newValueArray[0]]
        activeThumb.value = 'end'
      }
    }
    else {
      newValueArray[1] = newValue

      // 处理滑块交换
      if (newValue < newValueArray[0]) {
        [newValueArray[0], newValueArray[1]] = [newValueArray[1], newValueArray[0]]
        activeThumb.value = 'start'
      }
    }

    // 只在值实际变化时更新
    if (valueArray.value[0] !== newValueArray[0] || valueArray.value[1] !== newValueArray[1]) {
      modelValue.value = newValueArray
    }
  }
  else if (modelValue.value !== newValue) {
    modelValue.value = newValue
  }
}

// 使用requestAnimationFrame优化视图动画更新
function scheduleUpdate() {
  if (animationFrameId)
    return

  animationFrameId = requestAnimationFrame(() => {
    if (lastClientX !== null) {
      updateValueFromPosition(lastClientX)
    }

    animationFrameId = null

    if (isDragging) {
      scheduleUpdate()
    }
  })
}

// 统一的事件处理函数
function startDragging(e: PointerEvent, thumb: 'start' | 'end') {
  isDragging = true
  activeThumb.value = thumb
  lastClientX = e.clientX

  // 立即更新一次值
  updateValueFromPosition(e.clientX)

  document.addEventListener('pointermove', handleMove, { passive: false })
  document.addEventListener('pointerup', endDragging, { once: true })
  document.addEventListener('pointercancel', endDragging, { once: true })
}

function handleMove(e: PointerEvent) {
  if (!isDragging)
    return

  e.preventDefault()
  lastClientX = e.clientX
  scheduleUpdate()
}

function endDragging() {
  isDragging = false
  lastClientX = null
  activeThumb.value = null

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }

  document.removeEventListener('pointermove', handleMove)
  document.removeEventListener('pointercancel', endDragging)
}

function handleSliderClick(e: PointerEvent) {
  if (isDragging || !props.range)
    return

  const rect = sliderRef.value?.getBoundingClientRect()
  if (!rect)
    return

  const clickPosition = (e.clientX - rect.left) / rect.width
  const startPos = startPercentage.value / 100
  const endPos = endPercentage.value / 100

  // 选择最近的滑块
  const thumb = Math.abs(clickPosition - startPos) < Math.abs(clickPosition - endPos)
    ? 'start'
    : 'end'

  startDragging(e, thumb)
}

function onWrapperPointerdown(ev: PointerEvent) {
  if (props.range) {
    handleSliderClick(ev)
    return
  }

  startDragging(ev, 'end')
}

// 初始化modelValue类型
function initModelValue() {
  if (props.range && !Array.isArray(modelValue.value)) {
    modelValue.value = [props.min, modelValue.value as number]
  }
  else if (!props.range && Array.isArray(modelValue.value)) {
    modelValue.value = modelValue.value[1]
  }
}

initModelValue()

onBeforeUnmount(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  document.removeEventListener('pointermove', handleMove)
  document.removeEventListener('pointerup', endDragging)
  document.removeEventListener('pointercancel', endDragging)
})
</script>

<template>
  <div
    ref="sliderRef"
    :role="range ? 'group' : 'slider'"
    :class="computedSize.track"
    class="pxd-slider group/slider relative bg-gray-200 flex items-center rounded-full select-none touch-none"
    @pointerdown.prevent="onWrapperPointerdown"
  >
    <div
      class="pxd-slider--track absolute h-full bg-primary rounded-full group-hover/slider:will-change-[width,left]"
      :style="trackStyle"
    />

    <div
      v-if="props.range"
      class="pxd-slider--thumb absolute bg-background rounded-xs hover:scale-130 active:scale-130 active:z-10 -translate-x-1/2"
      :class="[{ 'scale-130': activeThumb === 'start' }, computedSize.thumb]"
      :style="{ left: `${startPercentage}%` }"
      @pointerdown.prevent.stop="startDragging($event, 'start')"
    />

    <div
      class="pxd-slider--thumb absolute bg-background rounded-xs hover:scale-130 active:scale-130 active:z-10 -translate-x-1/2"
      :class="[{ 'scale-130': activeThumb === 'end' }, computedSize.thumb]"
      :style="{ left: `${endPercentage}%` }"
      @pointerdown.prevent.stop="startDragging($event, 'end')"
    />
  </div>
</template>

<style>
.pxd-slider--thumb {
  box-shadow: 0 0 0 1px var(--gray-alpha-500), 0 1px 2px var(--gray-alpha-100);
}

.pxd-slider--thumb::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200%;
  height: 200%;
}
</style>
