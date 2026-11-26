<script lang="ts" setup>
import type { RadioGroupEmits, RadioGroupProps } from './types'
import { optionItems } from '../../agent/items.js'
import { useAgentChange } from '../../composables/_internal/use-agent-change.js'
import { useAgentNode } from '../../composables/_internal/use-agent-node.js'
import { cancelableChangeDetailsFor } from '../../composables/_internal/use-change-details.js'
import { useFormControl } from '../../composables/_internal/use-form-control.js'
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

const groupId = getUniqueId('p-radio-group')

const notify = useAgentChange(emits)
const {
  id: controlId,
  invalid: isInvalid,
  required: isRequired,
  describedBy,
  labelId,
} = useFormControl({
  id: () => props.id,
  fallbackId: groupId,
  invalid: () => props.invalid,
})

useAgentNode({
  name: 'radio-group',
  closed: true,
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

provideRadioGroupContext({ props, emits, name: groupId })
</script>

<template>
  <PStack
    data-radio-group
    class="pxd-radio-group"
    role="radiogroup"
    :id="controlId"
    :aria-invalid="isInvalid || undefined"
    :aria-required="isRequired || undefined"
    :aria-describedby="describedBy || undefined"
    :aria-labelledby="labelId || undefined"
    v-bind="$attrs"
  >
    <slot>
      <PRadio v-for="option in options" :key="option.value" v-bind="option" />
    </slot>
  </PStack>
</template>
