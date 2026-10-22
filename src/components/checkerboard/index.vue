<script lang="ts" setup>
import type { CheckerboardProps } from './types'
import { computed } from 'vue'
import { getCssUnitValue } from '../../utils/format.js'

defineOptions({
  name: 'PCheckerboard',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<CheckerboardProps>(), {
  variant: 'checkerboard',
})

const computedStyle = computed(() => ({
  '--checkerboard-size': getCssUnitValue(props.size),
  '--checkerboard-primary-color': props.primaryColor,
  '--checkerboard-background-color': props.backgroundColor,
}))
</script>

<template>
  <div
    data-checkerboard
    class="pxd-checkerboard bg-center"
    :data-variant="variant"
    :style="computedStyle"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<style>
.pxd-checkerboard {
  --checkerboard-size: 20px;
  --checkerboard-primary-color: var(--color-gray-200);
  --checkerboard-background-color: var(--color-background-100);
  background-image: repeating-conic-gradient(
    var(--checkerboard-background-color) 0,
    var(--checkerboard-background-color) 25%,
    var(--checkerboard-primary-color) 25%,
    var(--checkerboard-primary-color) 50%
  );

  background-size: var(--checkerboard-size) var(--checkerboard-size);
}

.pxd-checkerboard[data-variant='grid'],
.pxd-checkerboard[data-variant='dots'] {
  background-color: var(--checkerboard-background-color);
}

.pxd-checkerboard[data-variant='grid'] {
  background-position: calc(var(--checkerboard-size) / 2) calc(var(--checkerboard-size) / 2);
  background-image:
    linear-gradient(
      to right,
      transparent calc(100% - 1px),
      var(--checkerboard-primary-color) calc(100% - 1px)
    ),
    linear-gradient(
      to bottom,
      transparent calc(100% - 1px),
      var(--checkerboard-primary-color) calc(100% - 1px)
    );
}

.pxd-checkerboard[data-variant='dots'] {
  background-position: 0 0;
  background-image: radial-gradient(var(--checkerboard-primary-color) 1px, transparent 1px);
}
</style>
