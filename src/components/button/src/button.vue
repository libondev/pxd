<script lang="ts" setup>
import type { ButtonShapes, ButtonSizes, ButtonVariants } from '../index.js'

import { buttonShapes, getButtonSizes, getButtonVariant } from '../index.js'

interface ButtonProps {
  type?: HTMLButtonElement['type']
  icon?: boolean
  shadow?: boolean
  loading?: boolean
  disabled?: boolean
  shape?: ButtonShapes
  variant?: ButtonVariants
  size?: ButtonSizes
}

defineOptions({
  name: 'PButton',
})

const {
  type = 'button',
  shadow = false,
  shape = 'normal',
  variant = 'default',
  size = 'default',
} = defineProps<ButtonProps>()

const enableShadow = computed(() => shadow && !['ghost', 'underline'].includes(variant))

const buttonSize = computed(() => getButtonSizes(size))
const buttonVariant = computed(() => getButtonVariant(variant))
</script>

<template>
  <button
    :type="type"
    class="pxd-button p-ring"
    :disabled="disabled || loading"
    :class="[
      buttonVariant,
      buttonSize,
      buttonShapes[shape],
      { 'shadow-sm': enableShadow, 'w-8 h-8 !p-0': icon },
    ]"
  >
    <PSpinner v-if="loading" />

    <slot name="prefix" />

    <span class="px-1.5 flex items-center text-nowrap overflow-hidden">
      <slot />
    </span>

    <slot name="suffix" />
  </button>
</template>
