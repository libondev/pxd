<script lang="ts" setup>
import type { StepsItemState } from '../../contexts/steps'
import type { StepsEmits, StepsProps } from './types'
import { computed } from 'vue'
import { useModelValue } from '../../composables/_internal/use-model-value.js'
import { useOrderedChildren } from '../../composables/_internal/use-ordered-children.js'
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

const itemRegistry = useOrderedChildren<StepsItemState>()
const items = itemRegistry.items

const SIZES = {
  sm: {
    indicatorSize: '1.25rem',
    indicatorFontSize: '0.6875rem',
    iconSize: '0.75rem',
    titleFontSize: '0.8125rem',
    descriptionFontSize: '0.75rem',
    gap: '0.5rem',
  },
  md: {
    indicatorSize: '1.75rem',
    indicatorFontSize: '0.8125rem',
    iconSize: '0.875rem',
    titleFontSize: '0.875rem',
    descriptionFontSize: '0.75rem',
    gap: '0.5rem',
  },
  lg: {
    indicatorSize: '2.25rem',
    indicatorFontSize: '0.9375rem',
    iconSize: '1rem',
    titleFontSize: '1rem',
    descriptionFontSize: '0.8125rem',
    gap: '0.5rem',
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

function registerItem(key: string, item: StepsItemState, el?: HTMLElement | null) {
  itemRegistry.register(key, item, el)
}

function unregisterItem(key: string) {
  itemRegistry.unregister(key)
}

function select(index: number) {
  if (!props.clickable) {
    return
  }

  const item = items.value[index]

  if (!item || item.payload.disabled) {
    return
  }

  modelValue.value = index
}

provideStepsContext({
  props,
  items,
  registerItem,
  unregisterItem,
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
