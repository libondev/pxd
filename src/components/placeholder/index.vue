<script lang="ts" setup>
import { computed } from 'vue'
import { getCssUnitValue } from '../../utils/format'

interface Props {
  width?: string
  height?: string
  invert?: boolean
}

defineOptions({
  name: 'PPlaceholder',
  inheritAttrs: false,
})

const props = defineProps<Props>()

const computedStyle = computed(() => {
  return {
    width: getCssUnitValue(props.width),
    height: getCssUnitValue(props.height),
  }
})
</script>

<template>
  <div
    class="pxd-placeholder relative max-w-full overflow-hidden rounded-lg"
    :class="{ 'is-invert': invert }"
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
  background-image: repeating-linear-gradient(var(--deg), currentColor 0 1px, #0000 0 50%);
  background-size: 10px 10px;
  background-repeat: repeat;
  background-position: 0 0;
  background-origin: padding-box;
}
</style>
