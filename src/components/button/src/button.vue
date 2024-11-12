<script lang="ts" setup>
import { buttonVariants } from '../index'

interface ButtonProps {
  type?: HTMLButtonElement['type']
  icon?: boolean
  shadow?: boolean
  loading?: boolean
  disabled?: boolean
  shape?: keyof typeof SHAPES
  variant?: keyof typeof buttonVariants
}

defineOptions({
  name: 'PButton',
})

const props = withDefaults(
  defineProps<ButtonProps>(),
  {
    icon: false,
    type: 'button',
    variant: 'default',
    disabled: false,
    shape: 'normal',
    shadow: true,
  },
)

const SHAPES = {
  normal: 'rounded-md',
  square: 'rounded-none',
  rounded: 'rounded-full',
  circle: 'rounded-full overflow-hidden w-8 !p-1',
}

const enableShadow = computed(() => props.shadow && !['ghost', 'link'].includes(props.variant))
</script>

<template>
  <button
    :type="type"
    class="pxd-button"
    :disabled="disabled || loading"
    :class="[
      buttonVariants.base,
      buttonVariants[variant],
      SHAPES[shape],
      { 'shadow-sm': enableShadow, 'w-8 h-8 p-0': icon },
    ]"
  >
    <PSpinner v-if="loading" />

    <slot name="prefix" />

    <span class="px-1">
      <slot />
    </span>

    <slot name="suffix" />
  </button>
</template>
