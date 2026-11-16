<script lang="ts" setup>
import type { RadioGroupEmits, RadioGroupProps } from './types'
import { useAgentNode } from '../../composables/_internal/use-agent-node.js'
import { emitChange } from '../../composables/_internal/use-change-details.js'
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

useAgentNode({
  name: 'radio-group',
  state: () => ({ value: props.modelValue ?? null }),
  actions: {
    setValue: (value) => emitChange(emits, value),
  },
})

provideRadioGroupContext({ props, emits, name: getUniqueId() })
</script>

<template>
  <PStack
    data-radio-group
    class="pxd-radio-group"
    role="radiogroup"
    aria-label="Radio Group"
    v-bind="$attrs"
  >
    <slot>
      <PRadio v-for="option in options" :key="option.value" v-bind="option" />
    </slot>
  </PStack>
</template>
