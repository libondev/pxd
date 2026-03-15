<script lang="ts" setup>
import type { ToggleButtonGroupProps, ToggleButtonGroupEmits } from './types'
import { tv } from 'tailwind-variants'
import { computed } from 'vue'
import { useConfigProvider } from '../../contexts/config-provider'
import { provideToggleButtonGroupContext } from '../../contexts/toggle-button'
import PStack from '../stack/index.vue'
import PToggleButton from '../toggle-button/index.vue'

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
  multiple: true,
  modelValue: () => [],
})
const emits = defineEmits<ToggleButtonGroupEmits>()

const configProvider = useConfigProvider()

const toggleButtonGroupVariant = tv({
  base: 'pxd-toggle-button-group group/toggle-button-group w-max overflow-hidden',
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

const computedClasses = computed(() =>
  toggleButtonGroupVariant({
    size: computedSize.value,
    variant: props.variant,
  }),
)

provideToggleButtonGroupContext({ props, emits })
</script>

<template>
  <PStack
    role="group"
    :class="computedClasses"
    aria-label="Toggle Button Group"
    align="center"
    :gap="gap"
    :data-gap="gap"
    v-bind="$attrs"
  >
    <slot>
      <PToggleButton v-for="option in options" :key="option.value" v-bind="option" />
    </slot>
  </PStack>
</template>
