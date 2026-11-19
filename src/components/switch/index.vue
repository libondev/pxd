<script lang="ts" setup>
import type { SwitchProps, SwitchEmits } from './types'
import { computed } from 'vue'
import { optionItems } from '../../agent/items.js'
import { useAgentChange } from '../../composables/_internal/use-agent-change.js'
import { useAgentNode } from '../../composables/_internal/use-agent-node.js'
import { cancelableChangeDetailsFor } from '../../composables/_internal/use-change-details.js'
import { BASIC_HEIGHTS, SIZE_TEXT_CLASS } from '../../constants/size.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { provideSwitchContext } from '../../contexts/switch.js'
import { getUniqueId, getFallbackValue } from '../../utils/helper.js'
import PSwitchItem from '../switch-item/index.vue'

defineOptions({
  name: 'PSwitch',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<SwitchProps>(), {
  options: () => [],
  modelValue: '',
})

const emits = defineEmits<SwitchEmits>()

const SIZES = {
  sm: `${BASIC_HEIGHTS.sm} ${SIZE_TEXT_CLASS.sm}`,
  md: `${BASIC_HEIGHTS.md} ${SIZE_TEXT_CLASS.md}`,
  lg: `${BASIC_HEIGHTS.lg} ${SIZE_TEXT_CLASS.lg}`,
}

const notify = useAgentChange(emits)
const configProvider = useConfigProvider()

const computedSize = computed(() => getFallbackValue(props.size, SIZES, configProvider.size))

useAgentNode({
  name: 'switch',
  items: () => optionItems(props.options, props.modelValue),
  state: () => ({ value: props.modelValue ?? null }),
  actions: {
    setValue: (value) => {
      const details = cancelableChangeDetailsFor({ reason: 'api' })

      notify(value, details)

      if (!details.canceled) {
        emits('update:model-value', value)
      }
    },
  },
})

provideSwitchContext({ props, emits, name: getUniqueId() })
</script>

<template>
  <div
    data-switch
    role="radiogroup"
    class="pxd-switch p-1 flex touch-manipulation rounded-lg border"
    :class="[fullWidth ? 'w-full' : 'w-max', computedSize]"
    v-bind="$attrs"
  >
    <slot>
      <PSwitchItem
        v-for="option in options"
        :key="option.value"
        :label="option.label"
        :value="option.value"
        :disabled="option.disabled"
      />
    </slot>
  </div>
</template>
