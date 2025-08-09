<script setup lang="ts">
import type { ComponentDirection } from '../../types/shared/props'
import { computed } from 'vue'
import { getCssUnitValue } from '../../utils/format'

interface Props {
  size?: number | string
  color?: string
  top?: boolean
  left?: boolean
  right?: boolean
  bottom?: boolean
  direction?: ComponentDirection
}

defineOptions({
  name: 'PFader',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    direction: 'horizontal',
  },
)

const computedStyle = computed(() => ({ '--size': getCssUnitValue(props.size), '--color': props.color }))
</script>

<template>
  <div
    aria-hidden="true"
    :data-direction="direction"
    class="pxd-fader inset-0 pointer-events-none absolute size-full rounded-inherit motion-safe:before:transition-opacity motion-safe:after:transition-opacity"
    :class="{ left, top, right, bottom }"
    :style="computedStyle"
  />
</template>

<style lang="postcss">
.pxd-fader {
  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: inherit;
    background: linear-gradient(var(--dir), transparent, var(--color, var(--color-gray-alpha-500)));
    mask-image: linear-gradient(var(--dir-revert), var(--color, var(--color-gray-alpha-500)) 50%, transparent);
    opacity: 0;
  }

  &.left::before,
  &.top::before,
  &.right::after,
  &.bottom::after {
    opacity: 1;
  }

  &[data-direction="horizontal"] {
    &::before,
    &::after {
      top: 0;
      width: var(--size, 16px);
      height: 100%;
    }

    &::before {
      left: 0;
      --dir: to left;
      --dir-revert: to right;
    }

    &::after {
      right: 0;
      --dir: to right;
      --dir-revert: to left;
    }
  }

  &[data-direction="vertical"] {
    &::before,
    &::after {
      left: 0;
      width: 100%;
      height: var(--size, 16px);
    }

    &::before {
      top: 0;
      --dir: to top;
      --dir-revert: to bottom;
    }

    &::after {
      bottom: 0;
      --dir: to bottom;
      --dir-revert: to top;
    }
  }
}
</style>
