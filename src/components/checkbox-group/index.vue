<script lang="ts" setup>
import type { CheckboxGroupEmits, CheckboxGroupProps } from './types'
import { optionItems } from '../../agent/items.js'
import { useAgentChange } from '../../composables/_internal/use-agent-change.js'
import { useAgentNode } from '../../composables/_internal/use-agent-node.js'
import { cancelableChangeDetailsFor } from '../../composables/_internal/use-change-details.js'
import { useFormControl } from '../../composables/_internal/use-form-control.js'
import { provideCheckboxGroupContext } from '../../contexts/checkbox.js'
import { getUniqueId } from '../../utils/helper.js'
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

const {
  id: controlId,
  invalid: isInvalid,
  disabled: isDisabled,
  required: isRequired,
  describedBy,
  labelId,
} = useFormControl({
  id: () => props.id,
  fallbackId: getUniqueId('p-checkbox-group'),
  invalid: () => props.invalid,
  disabled: () => props.disabled,
})

useAgentNode({
  name: 'checkbox-group',
  closed: true,
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

provideCheckboxGroupContext({
  props,
  emits,
  get disabled() {
    return isDisabled.value
  },
})
</script>

<template>
  <PStack
    data-checkbox-group
    class="pxd-checkbox-group"
    role="group"
    aria-label="Checkbox Group"
    aria-multiselectable="true"
    :id="controlId"
    :aria-invalid="isInvalid || undefined"
    :aria-disabled="isDisabled || undefined"
    :aria-required="isRequired || undefined"
    :aria-describedby="describedBy || undefined"
    :aria-labelledby="labelId || undefined"
    v-bind="$attrs"
  >
    <slot>
      <PCheckbox v-for="option in options" :key="option.value" v-bind="option" />
    </slot>
  </PStack>
</template>
