<script lang="ts" setup>
import type { StepsOption, StepsEmits, StepsProps, StepsStatus } from './types'
import { computed } from 'vue'
import { useAgentNode } from '../../composables/_internal/use-agent-node.js'
import { useModelValue } from '../../composables/_internal/use-model-value.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { getFallbackValue } from '../../utils/helper.js'
import PStepsItem from '../_internal/step-item.vue'

defineOptions({
  name: 'PSteps',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<StepsProps>(), {
  status: 'process',
  direction: 'horizontal',
  options: () => [],
})
const emits = defineEmits<StepsEmits>()

const SIZES = {
  sm: {
    indicatorSize: '1.25rem',
    indicatorFontSize: '0.6875rem',
    iconSize: '0.75rem',
    titleFontSize: '0.75rem',
    descriptionFontSize: '0.75rem',
    gap: '0.5rem',
  },
  md: {
    indicatorSize: '1.75rem',
    indicatorFontSize: '0.75rem',
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
    descriptionFontSize: '0.75rem',
    gap: '0.5rem',
  },
}

const activeValue = useModelValue(props, emits, {
  defaultValue: () => props.defaultValue,
})
const activeIndex = computed(() => activeValue.value ?? 0)

const configProvider = useConfigProvider()

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

useAgentNode({
  name: 'steps',
  state: () => ({ value: activeIndex.value }),
  actions: {
    setValue: (value) => select(Number(value)),
  },
})

function resolveStatus(option: StepsOption, index: number): StepsStatus {
  if (option.status) {
    return option.status
  }

  if (index < activeIndex.value) {
    return 'finish'
  }

  if (index === activeIndex.value) {
    return props.status
  }

  return 'wait'
}

function select(index: number) {
  const option = props.options[index]

  if (!props.clickable || !option || option.disabled || index === activeIndex.value) {
    return
  }

  activeValue.value = index
}
</script>

<template>
  <div
    data-steps
    class="pxd-steps group/steps flex w-full max-w-full data-[direction=vertical]:flex-col"
    :data-direction="direction"
    :style="computedStyle"
    v-bind="$attrs"
  >
    <template v-for="(option, index) in options" :key="index">
      <PStepsItem
        v-if="$slots.item"
        :clickable="clickable"
        :index="index"
        :option="option"
        :status="resolveStatus(option, index)"
        @select="select"
      >
        <slot name="item" :index="index" :item="option" :status="resolveStatus(option, index)" />
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
