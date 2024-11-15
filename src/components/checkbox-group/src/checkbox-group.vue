<script setup lang="ts">
import type { CheckboxGroupProps } from '../index.js'
import { getFlowDirection } from '../../_utils/css.js'

const {
  direction = 'row',
} = defineProps<CheckboxGroupProps>()

const layoutDirection = getFlowDirection(direction)
</script>

<template>
  <div class="flex gap-3" :class="layoutDirection">
    <slot />
  </div>
</template>
