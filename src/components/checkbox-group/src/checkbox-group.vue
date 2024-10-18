<script setup lang="ts">
import type { CheckboxGroupProps } from '..'

const props = withDefaults(
  defineProps<CheckboxGroupProps>(),
  {
    direction: 'row',
  },
)

const layoutDirection = getLayoutDirection(props.direction)
</script>

<template>
  <div class="flex gap-3" :class="layoutDirection">
    <slot />
  </div>
</template>
