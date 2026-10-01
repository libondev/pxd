<script lang="ts" setup>
import type { StepsOption, StepsEmits, StepsProps, StepsStatus } from './types'
import { computed, shallowRef, useSlots } from 'vue'
import { useModelValue } from '../../composables/_internal/use-model-value.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { getFallbackValue } from '../../utils/helper.js'
import PStepsItem from './step-item.vue'

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
  options: () => [],
})
const emits = defineEmits<StepsEmits>()

const configProvider = useConfigProvider()
const slots = useSlots()

const modelValue = useModelValue(props, emits)
/** Uncontrolled fallback: a bound `modelValue` always wins. */
const innerValue = shallowRef<number | undefined>(props.defaultValue)
const activeIndex = computed(() => props.modelValue ?? innerValue.value ?? 0)

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

function resolveStatus(option: StepsOption, index: number): StepsStatus {
  if (option.status) {
    return option.status
  }

  if (index < activeIndex.value) {
    return 'finish'
  }

  if (index === activeIndex.value) {
    return props.status ?? 'process'
  }

  return 'wait'
}

function select(index: number) {
  const option = props.options[index]

  if (!props.clickable || !option || option.disabled || index === activeIndex.value) {
    return
  }

  innerValue.value = index
  modelValue.value = index
}
</script>

<template>
  <div
    class="pxd-steps group/steps flex w-full max-w-full data-[direction=vertical]:flex-col"
    :data-direction="direction"
    :style="computedStyle"
    v-bind="$attrs"
  >
    <template v-for="(option, index) in options" :key="index">
      <PStepsItem
        v-if="slots.item"
        :clickable="clickable"
        :index="index"
        :option="option"
        :status="resolveStatus(option, index)"
        @select="select"
      >
        <slot name="item" :index="index" :option="option" :status="resolveStatus(option, index)" />
      </PStepsItem>
      <PStepsItem
        v-else
        :clickable="clickable"
        :index="index"
        :option="option"
        :status="resolveStatus(option, index)"
        @select="select"
      />
    </template>
  </div>
</template>
