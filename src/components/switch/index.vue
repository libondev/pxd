<script lang="ts" setup>
import type { SwitchProps, SwitchEmits } from './types'
import { computed } from 'vue'
import { useModelValue } from '../../composables/_internal/use-model-value'
import { BASIC_HEIGHTS } from '../../constants/size'
import { useConfigProvider } from '../../contexts/config-provider'
import { provideSwitchContext } from '../../contexts/switch'
import { getUniqueId, getFallbackValue } from '../../utils/helper'
import PSwitchItem from '../switch-item/index.vue'

defineOptions({
  name: 'PSwitch',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<SwitchProps>(), {
  options: () => [],
  modelValue: '',
})

const emits = defineEmits<SwitchEmits>()

const SIZES = {
  sm: `${BASIC_HEIGHTS.sm} text-13`,
  md: `${BASIC_HEIGHTS.md} text-sm`,
  lg: `${BASIC_HEIGHTS.lg} text-base`,
}

const configProvider = useConfigProvider()
const modelValue = useModelValue(props, emits)
const computedSize = computed(() => getFallbackValue(props.size, SIZES, configProvider.size))

provideSwitchContext({ props, emits, name: getUniqueId() })
</script>

<template>
  <div
    class="pxd-switch p-1 flex touch-manipulation rounded-lg border"
    :class="[fullWidth ? 'w-full' : 'w-max', computedSize]"
    v-bind="$attrs"
  >
    <slot>
      <PSwitchItem
        v-for="option in options"
        :key="option.value"
        v-model="modelValue"
        :label="option.label"
        :value="option.value"
        :disabled="option.disabled"
      />
    </slot>
  </div>
</template>
