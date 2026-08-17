<script lang="ts" setup>
import type { ButtonGroupProps } from './types'
import { provideButtonGroupContext } from '../../contexts/button.js'

defineOptions({
  name: 'PButtonGroup',
  inheritAttrs: false,
})

const props = defineProps<ButtonGroupProps>()

provideButtonGroupContext({ props })
</script>

<template>
  <div
    role="group"
    aria-label="Actions"
    data-group
    data-button-group
    class="pxd-button-group flex max-w-full"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>
