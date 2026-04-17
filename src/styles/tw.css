<script lang="ts" setup>
import type { MaterialProps } from './types'
import { tv } from 'tailwind-variants'
import { computed } from 'vue'
import PStack from '../stack/index.vue'

defineOptions({
  name: 'PMaterial',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<MaterialProps>(), {
  variant: 'default',
})

const materialVariants = tv({
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
})

const computedClasses = computed(() => {
  return materialVariants({
    variant: props.variant,
  })
})
</script>

<template>
  <PStack :class="computedClasses" v-bind="$attrs">
    <slot />
  </PStack>
</template>
