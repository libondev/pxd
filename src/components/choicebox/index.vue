<script lang="ts" setup>
import type { ChoiceboxEmits, ChoiceboxProps } from './types'
import { optionItems } from '../../agent/items.js'
import { useAgentChange } from '../../composables/_internal/use-agent-change.js'
import { useAgentNode } from '../../composables/_internal/use-agent-node.js'
import { cancelableChangeDetailsFor } from '../../composables/_internal/use-change-details.js'
import { provideChoiceboxContext } from '../../contexts/choicebox.js'
import { getUniqueId } from '../../utils/helper.js'
import PChoiceboxItem from '../choicebox-item/index.vue'
import PStack from '../stack/index.vue'

defineOptions({
  name: 'PChoicebox',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ChoiceboxProps>(), { gap: 3 })
const emits = defineEmits<ChoiceboxEmits>()
const notify = useAgentChange(emits)

useAgentNode({
  name: 'choicebox',
  items: () => optionItems(props.options, props.modelValue),
  state: () => ({ value: props.modelValue ?? (props.multiple ? [] : null) }),
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

provideChoiceboxContext({ props, emits, name: getUniqueId() })
</script>

<template>
  <PStack
    data-choicebox
    :gap="gap"
    :aria-label="label"
    :aria-multiselectable="multiple"
    :role="multiple ? 'group' : 'radiogroup'"
    class="pxd-choicebox"
    v-bind="$attrs"
  >
    <slot>
      <PChoiceboxItem v-for="option in options" :key="option.value" v-bind="option" />
    </slot>
  </PStack>
</template>
