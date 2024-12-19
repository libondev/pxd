<script lang="ts" setup>
import type { ButtonShapes, ButtonSizes, ButtonVariants } from '../index.js'

import Spinner from '#/components/spinner/index.js'
import { buttonShapes, getButtonSizes, getButtonVariant } from '../index.js'

interface ButtonProps {
  type?: HTMLButtonElement['type']
  icon?: boolean
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
  shape = 'normal',
  variant = 'default',
  size = 'default',
} = defineProps<ButtonProps>()

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
      { 'w-8 h-8 !p-0': icon },
    ]"
  >
    <Spinner v-if="loading" />

    <slot name="prefix" />

    <span class="px-1.5 flex items-center text-nowrap overflow-hidden" :class="{ 'px-1.5': !icon }">
      <slot />
    </span>

    <slot name="suffix" />
  </button>
</template>
