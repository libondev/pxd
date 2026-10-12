<script lang="ts" setup>
import type { HueTextProps } from './types'
import { computed } from 'vue'

defineOptions({
  name: 'PHueText',
  inheritAttrs: false,
})

const props = defineProps<HueTextProps>()

const hue = computed(() => {
  let hash = 0
  const name = props.text ?? ''

  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }

  return ((hash % 360) + 360) % 360
})

const hueStyle = computed(() => ({
  '--pxd-hue-h': hue.value,
}))
</script>

<template>
  <span
    data-hue-text
    class="pxd-hue-text gap-1 inline-flex max-w-full items-center"
    :style="hueStyle"
    :data-tinted="tinted"
    v-bind="$attrs"
  >
    <span v-if="$slots.prefix" class="inline-flex items-center">
      <slot name="prefix" />
    </span>
    {{ text }}
    <span v-if="$slots.suffix" class="inline-flex items-center">
      <slot name="suffix" />
    </span>
  </span>
</template>

<style>
.pxd-hue-text {
  --pxd-hue-l: 40%;
  color: hsl(var(--pxd-hue-h) 45% var(--pxd-hue-l));
}

.dark .pxd-hue-text {
  --pxd-hue-l: 72%;
}

.pxd-hue-text[data-tinted='true'] {
  background-color: color-mix(in srgb, currentColor 12%, transparent);
}
</style>
