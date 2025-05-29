<script lang="ts" setup>
import PStack from '../stack/index.vue'

interface Props {
  variant?: 'default' | 'small' | 'medium' | 'large' | 'tooltip' | 'menu' | 'modal' | 'fullscreen'
}

defineOptions({
  name: 'PMaterial',
})

withDefaults(
  defineProps<Props>(),
  {
    variant: 'default',
  },
)
</script>

<template>
  <PStack class="pxd-material" :class="variant">
    <slot />
  </PStack>
</template>

<style lang="postcss">
.pxd-material {
  --default-shadow: 0 0 0 1px rgba(0,0,0,0.08);
  --small-shadow: 0 0 0 1px rgba(0,0,0,0.08), 0px 2px 2px rgba(0,0,0,0.04);
  --medium-shadow: 0 0 0 1px rgba(0,0,0,0.08), 0px 2px 2px rgba(0,0,0,0.04),0px 8px 8px -8px rgba(0,0,0,0.04);
  --large-shadow: 0 0 0 1px rgba(0,0,0,0.08), 0px 2px 2px rgba(0,0,0,0.04),0px 8px 16px -4px rgba(0,0,0,0.04);
  --tooltip-shadow: 0 0 0 1px rgba(0,0,0,0.08),0px 1px 1px rgba(0,0,0,0.02),0px 4px 8px rgba(0,0,0,0.04);
  --menu-shadow: 0 0 0 1px rgba(0,0,0,0.08),0px 1px 1px rgba(0,0,0,0.02),0px 4px 8px -4px rgba(0,0,0,0.04),0px 16px 24px -8px rgba(0,0,0,0.06);
  --modal-shadow: 0 0 0 1px rgba(0,0,0,0.08),0px 1px 1px rgba(0,0,0,0.02),0px 8px 16px -4px rgba(0,0,0,0.04),0px 24px 32px -8px rgba(0,0,0,0.06);
  --fullscreen-shadow: 0 0 0 1px rgba(0,0,0,0.08),0px 1px 1px rgba(0,0,0,0.02),0px 8px 16px -4px rgba(0,0,0,0.04),0px 24px 32px -8px rgba(0,0,0,0.06);
  background-color: var(--color-background);

  &.default {
    border-radius: 6px;
    box-shadow: var(--default-shadow);
  }
  &.small {
    border-radius: 6px;
    box-shadow: var(--small-shadow);
  }
  &.medium {
    border-radius: 12px;
    box-shadow: var(--medium-shadow);
  }
  &.large {
    border-radius: 12px;
    box-shadow: var(--large-shadow);
  }
  &.tooltip {
    border-radius: 6px;
    box-shadow: var(--tooltip-shadow);
  }
  &.menu {
    border-radius: 12px;
    box-shadow: var(--menu-shadow);
  }
  &.modal {
    border-radius: 12px;
    box-shadow: var(--modal-shadow);
  }
  &.fullscreen {
    border-radius: 16px;
    box-shadow: var(--fullscreen-shadow);
  }
}

.dark .pxd-material {
  --default-shadow: 0 0 0 1px rgba(255,255,255,0.145);
  --small-shadow: 0 0 0 1px rgba(255,255,255,0.145),0px 1px 2px rgba(0,0,0,0.16);
  --medium-shadow: 0 0 0 1px rgba(255,255,255,0.145),0px 2px 2px rgba(0,0,0,0.32),0px 8px 8px -8px rgba(0,0,0,0.16);
  --large-shadow: 0 0 0 1px rgba(255,255,255,0.145),0px 2px 2px rgba(0,0,0,0.04),0px 8px 16px -4px rgba(0,0,0,0.04);
  --tooltip-shadow: 0 0 0 1px rgba(255,255,255,0.145),0px 1px 1px rgba(0,0,0,0.02),0px 4px 8px rgba(0,0,0,0.04);
  --menu-shadow: 0 0 0 1px rgba(255,255,255,0.145),0px 1px 1px rgba(0,0,0,0.02),0px 4px 8px -4px rgba(0,0,0,0.04),0px 16px 24px -8px rgba(0,0,0,0.06);
  --modal-shadow: 0 0 0 1px rgba(255,255,255,0.145),0px 1px 1px rgba(0,0,0,0.02),0px 8px 16px -4px rgba(0,0,0,0.04),0px 24px 32px -8px rgba(0,0,0,0.06);
  --fullscreen-shadow: 0 0 0 1px rgba(255,255,255,0.145),0px 1px 1px rgba(0,0,0,0.02),0px 8px 16px -4px rgba(0,0,0,0.04),0px 24px 32px -8px rgba(0,0,0,0.06);
}
</style>
