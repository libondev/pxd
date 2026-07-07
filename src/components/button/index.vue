<script lang="ts" setup>
import type { ButtonProps } from './types'
import { computed } from 'vue'
import { useTailwindVariant } from '../../composables/use-tailwind-variant'
import { BASIC_HEIGHTS } from '../../constants/size'
import { useButtonGroupContext } from '../../contexts/button'
import { useConfigProvider } from '../../contexts/config-provider'
import { isTruthyProp } from '../../utils/format'
import PSpinner from '../spinner/index.vue'

defineOptions({
  name: 'PButton',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ButtonProps>(), {
  icon: false,
  as: 'button',
})

const { attrs, classes: buttonClasses } = useTailwindVariant({
  base: 'pxd-button inline-flex shrink-0 cursor-pointer touch-manipulation items-center font-inherit select-none motion-safe:transition-appearance [[data-button-group]_&]:-ml-px [[data-button-group]_&]:not-first:rounded-l-none [[data-button-group]_&]:not-last:rounded-r-none [[data-button-group]_&]:enabled:hover:z-1',
  variants: {
    size: {
      xs: `${BASIC_HEIGHTS.xs} px-1 text-xs rounded-sm`,
      sm: `${BASIC_HEIGHTS.sm} px-1.5 text-sm rounded-md`,
      md: `${BASIC_HEIGHTS.md} px-2.5 text-sm rounded-md`,
      lg: `${BASIC_HEIGHTS.lg} px-3.5 text-base rounded-lg`,
    },
    shape: {
      square: 'rounded-none',
      rounded: 'rounded-full',
      default: '',
    },
    align: {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
    },
    variant: {
      simple: '',
      link: 'font-medium hover:underline hover:opacity-70 active:opacity-90 motion-safe:transition-opacity',
      default:
        'bg-background-100 text-foreground hover:bg-background-hover active:bg-background-active',
      ghost:
        'border-transparent bg-transparent text-foreground hover:bg-background-hover active:bg-background-active',
      primary:
        'border-transparent bg-primary text-gray-100 hover:bg-primary-hover active:bg-primary-active',
      error: 'text-white border-transparent bg-red-800 hover:bg-red-700 active:bg-red-900',
      warning: 'text-black border-transparent bg-amber-800 hover:bg-amber-700 active:bg-amber-900',
      success: 'text-white border-transparent bg-green-900 hover:bg-green-700 active:bg-green-800',
    },
    disabled: {
      true: 'is-disabled hover:bg-gray-100 active:bg-gray-100 disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-100 disabled:text-gray-700',
    },
    fullWidth: {
      true: 'w-full',
    },
    icon: {
      true: 'p-0 aspect-square',
      false: '[[data-button-group]_&]:flex-1',
    },
    loading: {
      true: '',
    },
  },
  compoundVariants: [
    {
      variant: ['default', 'ghost', 'primary', 'error', 'warning', 'success'],
      class: 'border self-focus-ring outline-none',
    },
  ],
})

const configProvider = useConfigProvider()
const buttonGroupContext = useButtonGroupContext()

const isDisabled = computed<boolean>(
  () =>
    isTruthyProp(props.disabled) ||
    isTruthyProp(props.loading) ||
    buttonGroupContext?.props.disabled ||
    false,
)

const computedClasses = computed(() => {
  const { size, shape, align, variant, fullWidth, icon } = props
  const internalAlign = icon ? 'center' : align

  return buttonClasses({
    icon,
    size: size || buttonGroupContext?.props.size || configProvider.size,
    shape: buttonGroupContext ? 'default' : shape,
    align: internalAlign || buttonGroupContext?.props.align || 'center',
    variant: variant || buttonGroupContext?.props.variant || 'default',
    fullWidth,
    disabled: isDisabled.value,
  })
})
</script>

<template>
  <Component
    :is="as"
    tabindex="0"
    aria-label="Action"
    :aria-busy="loading"
    :aria-disabled="isDisabled"
    :class="computedClasses"
    :disabled="isDisabled"
    v-bind="attrs"
  >
    <PSpinner v-if="loading" />

    <slot name="prefix" />

    <span class="inline-flex items-center truncate" :class="{ 'px-1.5': !icon }">
      <slot />
    </span>

    <slot name="suffix" />
  </Component>
</template>
