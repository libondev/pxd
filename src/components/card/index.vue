<script lang="ts" setup>
import type { CardProps } from './types'
import { computed } from 'vue'
import { useTailwindVariant } from '../../composables/use-tailwind-variant'

defineOptions({
  name: 'PCard',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<CardProps>(), {
  shape: 'default',
  border: true,
})

const { attrs, classes } = useTailwindVariant(
  {
    base: 'pxd-card border bg-background-100',
    variants: {
      shape: {
        default: 'rounded-md',
        square: 'rounded-none',
        rounded: 'rounded-xl',
      },
      border: {
        false: 'border-transparent',
      },
    },
  },
  {
    selection: () => ({
      shape: props.shape,
      border: props.border,
    }),
  },
)
</script>

<template>
  <div :class="classes" v-bind="attrs">
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
