<script lang="ts" setup>
import type { CardProps } from './types'
import { tv } from 'tailwind-variants'
import { computed } from 'vue'

defineOptions({
  name: 'PCard',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<CardProps>(), {
  shape: 'rounded',
  border: true,
})

const card = tv({
  base: 'pxd-card bg-background-100 text-trim',
  variants: {
    shape: {
      square: 'rounded-none',
      rounded: 'rounded-lg',
    },
    border: {
      true: 'border',
    },
  },
})

const computedClasses = computed(() => {
  return card({
    shape: props.shape,
    border: props.border,
  })
})
</script>

<template>
  <div :class="computedClasses" v-bind="$attrs">
    <div v-if="$slots.header" class="pxd-card--header text-trim">
      <slot name="header" />
    </div>
    <div class="pxd-card--content p-4 text-trim">
      <slot />
    </div>
    <div v-if="$slots.footer" class="pxd-card--footer text-trim">
      <slot name="footer" />
    </div>
  </div>
</template>
