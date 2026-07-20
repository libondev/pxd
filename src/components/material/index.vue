<script lang="ts" setup>
import type { MaterialProps } from './types'
import { computed } from 'vue'
import { useTailwindVariant } from '../../composables/use-tailwind-variant'
import PStack from '../stack/index.vue'

defineOptions({
  name: 'PMaterial',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<MaterialProps>(), {
  variant: 'default',
})

const { attrs, classes } = useTailwindVariant(
  {
    base: 'pxd-material w-full bg-background-100',
    variants: {
      variant: {
        default: 'rounded-md shadow-border-base',
        small: 'rounded-md shadow-border-small',
        medium: 'rounded-xl shadow-border-medium',
        large: 'rounded-xl shadow-border-large',
        tooltip: 'rounded-md shadow-border-tooltip',
        menu: 'rounded-xl shadow-border-menu',
        modal: 'rounded-xl shadow-border-modal',
        fullscreen: 'rounded-2xl shadow-border-fullscreen',
      },
    },
  },
  {
    selection: () => ({ variant: props.variant }),
  },
)
</script>

<template>
  <PStack :class="classes" :data-variant="variant" v-bind="attrs">
    <slot />
  </PStack>
</template>
