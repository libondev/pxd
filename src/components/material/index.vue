<script lang="ts" setup>
import PStack from '../stack/index.vue'
import type { MaterialProps } from './types'

defineOptions({
  name: 'PMaterial',
  inheritAttrs: false,
})

withDefaults(defineProps<MaterialProps>(), {
  variant: 'default',
})
</script>

<template>
  <PStack class="pxd-material w-full bg-background-100" :class="variant" v-bind="$attrs">
    <slot />
  </PStack>
</template>

<style lang="postcss">
.pxd-material {
  &.default {
    border-radius: calc(var(--radius) - 2px);
    box-shadow: var(--shadow-border-default);
  }

  &.small {
    border-radius: calc(var(--radius) - 2px);
    box-shadow: var(--shadow-border-small);
  }

  &.medium {
    border-radius: calc(var(--radius) + 6px);
    box-shadow: var(--shadow-border-medium);
  }

  &.large {
    border-radius: calc(var(--radius) + 6px);
    box-shadow: var(--shadow-border-large);
  }

  &.tooltip {
    border-radius: calc(var(--radius) - 2px);
    box-shadow: var(--shadow-border-tooltip);
  }

  &.menu {
    border-radius: calc(var(--radius) + 6px);
    box-shadow: var(--shadow-border-menu);
  }

  &.modal {
    border-radius: calc(var(--radius) + 6px);
    box-shadow: var(--shadow-border-modal);
  }

  &.fullscreen {
    border-radius: calc(var(--radius) + 8px);
    box-shadow: var(--shadow-border-fullscreen);
  }
}
</style>
