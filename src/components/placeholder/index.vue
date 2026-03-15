<script lang="ts" setup>
import { invert } from 'es-toolkit'
import { computed } from 'vue'

import type { PlaceholderProps } from './types'

import { getCssUnitValue } from '../../utils/format'

defineOptions({
  name: 'PPlaceholder',
  inheritAttrs: false,
})

const props = defineProps<PlaceholderProps>()

const computedStyle = computed(() => {
  return {
    '--placeholder-color': props.color,
    '--placeholder-gap': getCssUnitValue(props.gap),
  }
})
</script>

<template>
  <div
    class="pxd-placeholder max-w-full min-w-full"
    :class="{ 'is-invert': invert }"
    :style="computedStyle"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<style lang="postcss">
.pxd-placeholder {
  &.is-invert {
    --placeholder-deg: 45deg;
  }

  --placeholder-deg: -45deg;
  background-image: linear-gradient(
    var(--placeholder-deg),
    var(--placeholder-color) 12.5%,
    #0000 12.5%,
    #0000 50%,
    var(--placeholder-color) 50%,
    var(--placeholder-color) 62.5%,
    #0000 62.5%,
    #0000 100%
  );
  background-clip: padding-box;
  background-position: 0 0;
  background-size: var(--placeholder-gap, 12px) var(--placeholder-gap, 12px);
}
</style>
