<script lang="ts" setup>
import PStack from '../stack/index.vue'

interface Props {
  variant?: 'default' | 'small' | 'medium' | 'large' | 'tooltip' | 'menu' | 'modal' | 'fullscreen'
}

defineOptions({
  name: 'PMaterial',
  inheritAttrs: false,
})

withDefaults(
  defineProps<Props>(),
  {
    variant: 'default',
  },
)
</script>

<template>
  <PStack class="pxd-material w-full bg-background-100" :class="variant" v-bind="$attrs">
    <slot />
  </PStack>
</template>

<style lang="postcss">
.pxd-material {
  &.default {
    border-radius: 6px;
    box-shadow: var(--shadow-border-default);
  }
  &.small {
    border-radius: 6px;
    box-shadow: var(--shadow-border-small);
  }
  &.medium {
    border-radius: 12px;
    box-shadow: var(--shadow-border-medium);
  }
  &.large {
    border-radius: 12px;
    box-shadow: var(--shadow-border-large);
  }
  &.tooltip {
    border-radius: 6px;
    box-shadow: var(--shadow-border-tooltip);
  }
  &.menu {
    border-radius: 12px;
    box-shadow: var(--shadow-border-menu);
  }
  &.modal {
    border-radius: 12px;
    box-shadow: var(--shadow-border-modal);
  }
  &.fullscreen {
    border-radius: 16px;
    box-shadow: var(--shadow-border-fullscreen);
  }
}
</style>
