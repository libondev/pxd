<script lang="ts" setup>
import type { ToggleButtonGroupProps, ToggleButtonGroupEmits } from '../toggle-button/types'
import { useConfigProvider } from '../../contexts/config-provider'
import { useModelValue } from '../../composables/use-model-value'
import PStack from '../stack/index.vue'
import PToggleButton from '../toggle-button/index.vue'
import { computed } from 'vue'
import { tv } from 'tailwind-variants'
import {
  provideToggleButtonGroupContext,
  provideToggleButtonGroupModelValue,
} from '../../contexts/toggle-button'

defineOptions({
  name: 'PToggleButtonGroup',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<ToggleButtonGroupProps>(), {
  gap: 0,
})
const emits = defineEmits<ToggleButtonGroupEmits>()

const modelValue = useModelValue(props, emits)
const configProvider = useConfigProvider()

const toggleButtonGroupVariant = tv({
  base: 'pxd-toggle-button-group overflow-hidden group/toggle-button-group w-max',
  variants: {
    size: {
      sm: 'rounded-md',
      md: 'rounded-md',
      lg: 'rounded-lg',
    },
    variant: {
      outline: '',
      ghost: '',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

const computedSize = computed(() => props.size || configProvider.size)

const computedClass = computed(() =>
  toggleButtonGroupVariant({
    size: computedSize.value,
    variant: props.variant,
  }),
)

provideToggleButtonGroupContext(props)
provideToggleButtonGroupModelValue(modelValue)
</script>

<template>
  <PStack
    role="group"
    :class="computedClass"
    aria-label="Toggle Button Group"
    align="center"
    :data-gap="gap"
    :gap="gap"
    v-bind="$attrs"
  >
    <slot>
      <PToggleButton
        v-for="option in options"
        :key="option.value"
        :size="computedSize"
        :label="option.label"
        :value="option.value"
        :disabled="option.disabled"
      />
    </slot>
  </PStack>
</template>
