<script lang="ts" setup>
import type { CheckboxGroupEmits, CheckboxGroupProps } from './types'
import { optionItems } from '../../agent/items.js'
import { useAgentChange } from '../../composables/_internal/use-agent-change.js'
import { useAgentNode } from '../../composables/_internal/use-agent-node.js'
import { cancelableChangeDetailsFor } from '../../composables/_internal/use-change-details.js'
import { provideCheckboxGroupContext } from '../../contexts/checkbox.js'
import PCheckbox from '../checkbox/index.vue'
import PStack from '../stack/index.vue'

defineOptions({
  name: 'PCheckboxGroup',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<CheckboxGroupProps>(), {
  modelValue: () => [],
  options: () => [],
})

const emits = defineEmits<CheckboxGroupEmits>()
const notify = useAgentChange(emits)

useAgentNode({
  name: 'checkbox-group',
  items: () => optionItems(props.options, props.modelValue),
  state: () => ({ value: props.modelValue ?? [] }),
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

provideCheckboxGroupContext({ props, emits })
</script>

<template>
  <PStack
    data-checkbox-group
    class="pxd-checkbox-group"
    role="group"
    aria-label="Checkbox Group"
    aria-multiselectable="true"
    v-bind="$attrs"
  >
    <slot>
      <PCheckbox v-for="option in options" :key="option.value" v-bind="option" />
    </slot>
  </PStack>
</template>
