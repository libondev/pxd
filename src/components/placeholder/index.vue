<script lang="ts" setup>
import { computed } from 'vue'
import { getCssUnitValue } from '../../utils/format'

interface Props {
  color?: string
  width?: string
  height?: string
  border?: boolean
  invert?: boolean
}

defineOptions({
  name: 'PPlaceholder',
  inheritAttrs: false,
})

const props = defineProps<Props>()

const computedStyle = computed(() => {
  return {
    color: props.color,
    width: getCssUnitValue(props.width),
    height: getCssUnitValue(props.height),
  }
})
</script>

<template>
  <div
    class="pxd-placeholder relative max-w-full overflow-hidden rounded-lg"
    :class="{ 'border': border, 'is-invert': invert }"
    :style="computedStyle"
    v-bind="$attrs"
  />
</template>

<style lang="postcss">
.pxd-placeholder {
  --deg: -45deg;

  &.is-invert {
    --deg: 45deg;
  }

  width: 100%;
  height: 36px;
  color: var(--color-gray-400);
  background-image: repeating-linear-gradient(var(--deg),currentColor 0 1px,#0000 0 50%);
  background-size: 10px 10px;
  background-repeat: repeat;
  background-position: 0 0;
  background-origin: padding-box;
}
</style>
