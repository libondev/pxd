<script lang="ts" setup>
import type { SwitchProps, SwitchEmits } from './types'
import { computed } from 'vue'
import { useModelValue } from '../../composables/_internal/use-model-value.js'
import { BASIC_HEIGHTS } from '../../constants/size.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { provideSwitchContext } from '../../contexts/switch.js'
import { getUniqueId, getFallbackValue } from '../../utils/helper.js'
import PSwitchItem from '../switch-item/index.vue'

defineOptions({
  name: 'PSwitch',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:model-value',
  },
})

const props = withDefaults(defineProps<SwitchProps>(), {
  options: () => [],
  modelValue: '',
})

const emits = defineEmits<SwitchEmits>()

const SIZES = {
  sm: `${BASIC_HEIGHTS.sm} text-sm`,
  md: `${BASIC_HEIGHTS.md} text-sm`,
  lg: `${BASIC_HEIGHTS.lg} text-base`,
}

const configProvider = useConfigProvider()

const computedSize = computed(() => getFallbackValue(props.size, SIZES, configProvider.size))

const modelValue = useModelValue(props, emits)

provideSwitchContext({ props, emits, name: getUniqueId() })
</script>

<template>
  <div
    data-switch
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
