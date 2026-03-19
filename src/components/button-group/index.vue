<script lang="ts" setup>
import type { ButtonGroupProps } from './types'
import { provideButtonGroupContext } from '../../contexts/button'

defineOptions({
  name: 'PButtonGroup',
  inheritAttrs: false,
})

const props = defineProps<ButtonGroupProps>()

provideButtonGroupContext({ props })
</script>

<template>
  <div role="group" aria-label="Actions" class="pxd-button-group flex max-w-full" v-bind="$attrs">
    <slot />
  </div>
</template>
