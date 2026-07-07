<script lang="ts" setup>
import type { CardProps } from './types'
import { computed } from 'vue'
import { useTailwindVariant } from '../../composables/use-tailwind-variant'

defineOptions({
  name: 'PCard',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<CardProps>(), {
  shape: 'rounded',
  border: true,
})

const { attrs, classes: cardClasses } = useTailwindVariant({
  base: 'pxd-card bg-background-100',
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
  return cardClasses({
    shape: props.shape,
    border: props.border,
  })
})
</script>

<template>
  <div :class="computedClasses" v-bind="attrs">
    <div v-if="$slots.header" class="pxd-card--header text-trim-both">
      <slot name="header" />
    </div>
    <div class="pxd-card--content p-4 text-trim-both">
      <slot />
    </div>
    <div v-if="$slots.footer" class="pxd-card--footer text-trim-both">
      <slot name="footer" />
    </div>
  </div>
</template>
