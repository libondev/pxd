<script lang="ts" setup>
import type { RadioGroupEmits, RadioGroupProps } from './types'
import { optionItems } from '../../agent/items.js'
import { useAgentChange } from '../../composables/_internal/use-agent-change.js'
import { useAgentNode } from '../../composables/_internal/use-agent-node.js'
import { cancelableChangeDetails } from '../../composables/_internal/use-change-details.js'
import { provideRadioGroupContext } from '../../contexts/radio.js'
import { getUniqueId } from '../../utils/helper.js'
import PRadio from '../radio/index.vue'
import PStack from '../stack/index.vue'

defineOptions({
  name: 'PRadioGroup',
  inheritAttrs: false,
})

const props = defineProps<RadioGroupProps>()
const emits = defineEmits<RadioGroupEmits>()
const notify = useAgentChange(emits)

useAgentNode({
  name: 'radio-group',
  items: () => optionItems(props.options, props.modelValue),
  state: () => ({ value: props.modelValue ?? null }),
  actions: {
    setValue: (value) => {
      const details = cancelableChangeDetails()

      notify(value, details)

      if (!details.canceled) {
        emits('update:model-value', value)
      }
    },
  },
})

provideRadioGroupContext({ props, emits, name: getUniqueId() })
</script>

<template>
  <PStack data-radio-group class="pxd-radio-group" role="radiogroup" v-bind="$attrs">
    <slot>
      <PRadio v-for="option in options" :key="option.value" v-bind="option" />
    </slot>
  </PStack>
</template>
