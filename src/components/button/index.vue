<script lang="ts" setup>
import type { ButtonProps } from './types'
import { tv } from 'tailwind-variants'
import { computed } from 'vue'
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
  align: 'center',
  variant: 'default',
})

const buttonVariants = tv({
  base: 'pxd-button inline-flex shrink-0 cursor-pointer touch-manipulation items-center font-inherit select-none motion-safe:transition-all',
  variants: {
    size: {
      xs: 'h-6 px-1 text-sm rounded-sm',
      sm: 'h-7.5 px-1.5 text-sm rounded-md',
      md: 'h-9 px-2.5 text-sm rounded-md',
      lg: 'h-10 px-3.5 text-base rounded-lg',
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
      icon: 'p-0! aspect-square',
      link: 'font-medium hover:underline hover:opacity-70 active:opacity-90 motion-safe:transition-opacity',
      default:
        'border-input bg-background-100 text-foreground hover:bg-background-hover active:bg-background-active',
      ghost:
        'border-transparent bg-transparent text-foreground hover:bg-background-hover active:bg-background-active',
      primary:
        'border-transparent bg-primary text-gray-100 hover:bg-primary-hover active:bg-primary-active',
      error: 'text-white border-transparent bg-red-800 hover:bg-red-700 active:bg-red-900',
      warning: 'text-black border-transparent bg-amber-800 hover:bg-amber-700 active:bg-amber-900',
      success: 'text-white border-transparent bg-green-800 hover:bg-green-700 active:bg-green-900',
    },
    disabled: {
      true: 'is-disabled hover:bg-gray-100 active:bg-gray-100 disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-100 disabled:text-gray-700',
    },
    fullWidth: {
      true: 'w-full',
    },
    icon: {
      true: 'p-0! aspect-square',
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
    {
      icon: true,
      class: 'p-0! aspect-square',
    },
  ],
})

const configProvider = useConfigProvider()
const isDisabled = computed<boolean>(
  () => isTruthyProp(props.disabled) || isTruthyProp(props.loading),
)

const computedClasses = computed(() => {
  const { size = configProvider.size, shape, align, variant, fullWidth, icon } = props

  return buttonVariants({
    icon,
    size,
    shape,
    align,
    variant,
    fullWidth,
    disabled: isDisabled.value,
  })
})
</script>

<template>
  <Component :is="as" role="button" :class="computedClasses" :disabled="isDisabled" v-bind="$attrs">
    <PSpinner v-if="loading" />

    <slot name="prefix" />

    <span class="inline-flex items-center truncate" :class="{ 'px-1.5': !icon }">
      <slot />
    </span>

    <slot name="suffix" />
  </Component>
</template>
