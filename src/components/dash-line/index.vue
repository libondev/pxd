<script lang="ts" setup>
import type { ComponentPosition } from '../../types/shared'
import { computed } from 'vue'
import { getCssUnitValue } from '../../utils/format'

interface Props {
  position?: ComponentPosition | ComponentPosition[]
  size?: string | number
  dash?: string | number
  gap?: string | number
}

defineOptions({
  name: 'PDashLine',
})

const props = defineProps<Props>()

const computedStyle = computed(() => ({
  '--dash': getCssUnitValue(props.dash),
  '--size': getCssUnitValue(props.size),
  '--gap': getCssUnitValue(props.gap),
}))
</script>

<template>
  <div class="pxd-dash-line relative max-w-full" :data-position="position" :style="computedStyle" />
</template>

<style lang="postcss">
.pxd-dash-line {
  --g: var(--gap, 8px);
  --d: var(--dash, 8px);
  --s: var(--size, 1px);
  width: 100%;

  &:not([data-position])::before,
  &[data-position*="top"]::before,
  &[data-position*="bottom"]::after,
  &[data-position*="left"]::before,
  &[data-position*="right"]::after {
    content: '';
    position: absolute;
    pointer-events: none;
    background-image: repeating-linear-gradient(to var(--p),
        currentColor 0 var(--d),
        transparent var(--d) calc(var(--d) + var(--g)));
  }

  &:not([data-position])::before,
  &[data-position*="top"]::before {
    top: 0;
  }

  &[data-position*="bottom"]::after {
    bottom: 0;
  }

  &[data-position*="left"]::before {
    left: 0;
  }

  &[data-position*="right"]::after {
    right: 0;
  }

  &:not([data-position])::before,
  &[data-position*="top"]::before,
  &[data-position*="bottom"]::after {
    --p: right;
    left: 0;
    right: 0;
    width: 100%;
    height: var(--s);
  }

  &[data-position*="left"]::before,
  &[data-position*="right"]::after {
    --p: bottom;
    top: 0;
    bottom: 0;
    width: var(--s);
  }
}
</style>
