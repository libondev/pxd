<script lang="ts" setup>
import type { CheckerboardProps } from './types'
import { computed } from 'vue'
import { getCssUnitValue } from '../../utils/format'

defineOptions({
  name: 'PCheckerboard',
  inheritAttrs: false,
})

const props = defineProps<CheckerboardProps>()

const computedStyle = computed(() => ({
  '--checkerboard-size': getCssUnitValue(props.size),
  '--checkerboard-primary-color': props.primaryColor,
  '--checkerboard-background-color': props.backgroundColor,
}))
</script>

<template>
  <div class="pxd-checkerboard bg-center" :style="computedStyle" v-bind="$attrs">
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
</style>
