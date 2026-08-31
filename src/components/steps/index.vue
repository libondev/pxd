<script lang="ts" setup>
import type { StepsItemState } from '../../contexts/steps'
import type { StepsEmits, StepsProps } from './types'
import { computed, shallowRef } from 'vue'
import { useModelValue } from '../../composables/_internal/use-model-value.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { provideStepsContext } from '../../contexts/steps.js'
import { getFallbackValue } from '../../utils/helper.js'

defineOptions({
  name: 'PSteps',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<StepsProps>(), {
  status: 'process',
  direction: 'horizontal',
})
const emits = defineEmits<StepsEmits>()

const configProvider = useConfigProvider()

const modelValue = useModelValue(props, emits)
const items = shallowRef<StepsItemState[]>([])

const SIZES = {
  sm: {
    indicatorSize: '1.25rem',
    indicatorFontSize: '0.6875rem',
    iconSize: '0.75rem',
    titleFontSize: '0.8125rem',
    descriptionFontSize: '0.75rem',
    gap: '0.375rem',
  },
  md: {
    indicatorSize: '1.75rem',
    indicatorFontSize: '0.8125rem',
    iconSize: '0.875rem',
    titleFontSize: '0.875rem',
    descriptionFontSize: '0.75rem',
    gap: '0.375rem',
  },
  lg: {
    indicatorSize: '2.25rem',
    indicatorFontSize: '0.9375rem',
    iconSize: '1rem',
    titleFontSize: '1rem',
    descriptionFontSize: '0.8125rem',
    gap: '0.375rem',
  },
}

const computedSize = computed(() => getFallbackValue(props.size, SIZES, configProvider.size))

const computedStyle = computed(() => {
  const size = computedSize.value

  return {
    '--steps-indicator-size': size.indicatorSize,
    '--steps-indicator-font-size': size.indicatorFontSize,
    '--steps-icon-size': size.iconSize,
    '--steps-title-font-size': size.titleFontSize,
    '--steps-description-font-size': size.descriptionFontSize,
    '--steps-gap': size.gap,
  }
})

function registerItem(item: StepsItemState) {
  items.value = [...items.value, item]
}

function unregisterItem(id: string) {
  items.value = items.value.filter((item) => item.id !== id)
}

function updateItem(item: StepsItemState) {
  items.value = items.value.map((current) => (current.id === item.id ? item : current))
}

function select(index: number) {
  if (!props.clickable) {
    return
  }

  const item = items.value[index]

  if (!item || item.disabled) {
    return
  }

  modelValue.value = index
}

provideStepsContext({
  props,
  items,
  registerItem,
  unregisterItem,
  updateItem,
  select,
})
</script>

<template>
  <div
    class="pxd-steps group/steps flex w-full max-w-full data-[direction=vertical]:flex-col"
    :data-direction="direction"
    :style="computedStyle"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>
