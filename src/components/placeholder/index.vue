<script lang="ts" setup>
import { computed } from 'vue'
import { getCssUnitValue } from '../../utils/format'

interface Props {
  gap?: number | string
  color?: string
  invert?: boolean
}

defineOptions({
  name: 'PPlaceholder',
  inheritAttrs: false,
})

const props = defineProps<Props>()

const computedStyle = computed(() => {
  return {
    '--placeholder-color': props.color,
    '--placeholder-gap': getCssUnitValue(props.gap),
  }
})
</script>

<template>
  <div
    class="pxd-placeholder max-w-full"
    :class="{ 'is-invert': invert }"
    :style="computedStyle"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<style lang="postcss">
.pxd-placeholder {
  --placeholder-deg: -45deg;

  &.is-invert {
    --placeholder-deg: 45deg;
  }

  background:
    repeating-linear-gradient(var(--placeholder-deg), var(--placeholder-color) 0 1px, #0000 0 50%)
    repeat
    0 0 / var(--placeholder-gap, 10px) var(--placeholder-gap, 10px)
    padding-box fixed;
}
</style>
