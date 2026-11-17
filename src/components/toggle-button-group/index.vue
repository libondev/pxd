<script lang="ts" setup>
import type { ToggleButtonGroupProps, ToggleButtonGroupEmits } from './types'
import { optionItems } from '../../agent/items.js'
import { useAgentChange } from '../../composables/_internal/use-agent-change.js'
import { useAgentNode } from '../../composables/_internal/use-agent-node.js'
import { cancelableChangeDetails } from '../../composables/_internal/use-change-details.js'
import { useTailwindVariant } from '../../composables/_internal/use-tailwind-variant.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { provideToggleButtonGroupContext } from '../../contexts/toggle-button.js'
import PStack from '../stack/index.vue'
import PToggleButton from '../toggle-button/index.vue'

defineOptions({
  name: 'PToggleButtonGroup',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ToggleButtonGroupProps>(), {
  gap: 0,
  variant: 'default',
  multiple: true,
  modelValue: () => [],
})
const emits = defineEmits<ToggleButtonGroupEmits>()
const notify = useAgentChange(emits)

const configProvider = useConfigProvider()

const { attrs, classes } = useTailwindVariant(
  {
    base: 'pxd-toggle-button-group group/toggle-button-group w-max',
    variants: {
      size: {
        xxs: 'rounded-sm',
        xs: 'rounded-sm',
        sm: 'rounded-md',
        md: 'rounded-md',
        lg: 'rounded-lg',
      },
    },
  },
  {
    selection: () => ({ size: props.size || configProvider.size }),
  },
)

useAgentNode({
  name: 'toggle-button-group',
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

provideToggleButtonGroupContext({ props, emits })
</script>

<template>
  <PStack
    role="group"
    data-toggle-button-group
    :class="classes"
    align="center"
    :gap="gap"
    :data-gap="gap"
    v-bind="attrs"
  >
    <slot>
      <PToggleButton v-for="option in options" :key="option.value" class="flex-1" v-bind="option" />
    </slot>
  </PStack>
</template>
