<script lang="ts" setup>
import type { DashLineProps } from './types'
import { computed } from 'vue'
import { getCssUnitValue } from '../../utils/format'

defineOptions({
  name: 'PDashLine',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DashLineProps>(), { position: () => ['top'] })

const computedStyle = computed(() => ({
  '--dash-line-color': props.color,
  '--dash-line-dash': getCssUnitValue(props.dashSize),
  '--dash-line-size': getCssUnitValue(props.lineSize),
  '--dash-line-gap': getCssUnitValue(props.gap),
}))
</script>

<template>
  <div
    class="pxd-dash-line relative max-w-full min-w-full"
    v-bind="$attrs"
    :data-position="position"
    :style="computedStyle"
  />
</template>

<style lang="postcss">
.pxd-dash-line {
  --g: var(--dash-line-gap, 8px);
  --d: var(--dash-line-dash, 8px);
  --s: var(--dash-line-size, 1px);
  --c: var(--dash-line-color, var(--color-gray-600));

  &[data-position*='top']::before,
  &[data-position*='bottom']::after,
  &[data-position*='left']::before,
  &[data-position*='right']::after {
    content: '';
    position: absolute;
    pointer-events: none;
    background-image: repeating-linear-gradient(
      to var(--p),
      var(--c) 0 var(--d),
      transparent var(--d) calc(var(--d) + var(--g))
    );
  }

  &[data-position*='top']::before {
    top: 0;
  }

  &[data-position*='bottom']::after {
    bottom: 0;
  }

  &[data-position*='left']::before {
    left: 0;
  }

  &[data-position*='right']::after {
    right: 0;
  }

  &[data-position*='top']::before,
  &[data-position*='bottom']::after {
    --p: right;
    left: 0;
    right: 0;
    width: 100%;
    height: var(--s);
  }

  &[data-position*='left']::before,
  &[data-position*='right']::after {
    --p: bottom;
    top: 0;
    bottom: 0;
    width: var(--s);
  }
}
</style>
