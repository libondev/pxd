<script lang="ts" setup>
import type { RateEmits, RateProps } from './types'
import StarIcon from '@gdsicon/vue/star'
import StarFillIcon from '@gdsicon/vue/star-fill'
import { computed, onBeforeUnmount, ref } from 'vue'
import { useModelValue } from '../../composables/use-model-value'
import { useConfigProvider } from '../../contexts/config-provider'
import { throttleByRaf } from '../../utils/event'
import { getFallbackValue } from '../../utils/helper'

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

const SIZES: Record<string, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
}

const configProvider = useConfigProvider()
const modelValue = useModelValue(props, emits)
const hoverValue = ref(0)

const computedSize = computed(() =>
  getFallbackValue(props.size as string, SIZES, configProvider.size),
)

const displayValue = computed(() => hoverValue.value || modelValue.value)

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

const scheduleHover = throttleByRaf((index: number, percent: number) => {
  if (props.allowHalf) {
    hoverValue.value = percent <= 0.5 ? index + 0.5 : index + 1
  } else {
    hoverValue.value = index + 1
  }
})

function handleMouseMove(index: number, event: MouseEvent) {
  if (props.readonly || props.disabled) {
    return
  }
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  scheduleHover(index, percent)
}

function handleMouseLeave() {
  if (props.readonly || props.disabled) {
    return
  }
  hoverValue.value = 0
}

function handleClick(index: number, event: MouseEvent) {
  if (props.readonly || props.disabled) {
    return
  }
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  let newValue: number
  if (props.allowHalf) {
    newValue = percent <= 0.5 ? index + 0.5 : index + 1
  } else {
    newValue = index + 1
  }
  if (props.clearable && newValue === modelValue.value) {
    modelValue.value = 0
  } else {
    modelValue.value = newValue
  }
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
  scheduleHover.cancel()
})
</script>

<template>
  <div
    ref="rateRef"
    role="radiogroup"
    tabindex="0"
    class="pxd-rate inline-flex items-center select-none"
    :class="[
      computedSize,
      {
        'pointer-events-none opacity-50': disabled,
        'cursor-default': readonly,
      },
    ]"
    v-bind="$attrs"
    @keydown="handleKeydown"
    @mouseleave="handleMouseLeave"
  >
    <span
      v-for="i in starCount"
      :key="i"
      class="pxd-rate--item relative inline-flex cursor-pointer"
      :class="{ 'cursor-default': readonly || disabled }"
      role="radio"
      :aria-checked="i <= modelValue"
      :aria-posinset="i"
      :aria-setsize="starCount"
      tabindex="-1"
      @mousemove="handleMouseMove(i - 1, $event)"
      @click="handleClick(i - 1, $event)"
    >
      <span class="pxd-rate--star-empty inline-flex text-gray-400" :style="{ color: voidColor }">
        <StarIcon />
      </span>
      <span
        class="pxd-rate--star-filled inset-0 absolute inline-flex overflow-hidden text-primary"
        :style="{
          width: fills[i - 1] * 100 + '%',
          color: color,
        }"
      >
        <StarFillIcon />
      </span>
    </span>
  </div>
</template>
