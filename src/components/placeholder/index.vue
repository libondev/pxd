<script lang="ts" setup>
import { computed } from 'vue'
import { getCssUnitValue } from '../../utils/format'

interface Props {
  color?: string
  width?: string
  height?: string
  border?: boolean
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
    class="pxd-placeholder relative max-w-full overflow-hidden rounded-lg border-dashed"
    :class="{ border }"
    :style="computedStyle"
    v-bind="$attrs"
  />
</template>

<style scoped>
.pxd-placeholder {
  width: 100%;
  height: 36px;
  color: var(--color-gray-300);
  background-image:
    repeating-linear-gradient(
      -45deg,
      currentColor 0,
      currentColor 1px,
      transparent 1px,
      transparent 8px
    );
  background-repeat: repeat;
  background-position: 0 0;
  background-origin: padding-box;
}
</style>
