<script setup lang="ts">
import { computed } from 'vue'
import { getCssUnitValue, isTruthyProp } from '../../utils/format'
import { chipVariant } from './cn'
import type { ChipProps } from './types'

const props = withDefaults(defineProps<ChipProps>(), {
  size: 10,
  label: '',
  variant: 'primary',
})

const computedClasses = computed(() => {
  return chipVariant({
    inset: props.inset,
    variant: props.variant,
    hasLabel: isTruthyProp(props.label),
  })
})
</script>

<template>
  <div class="pxd-chip relative inline-flex shrink-0">
    <slot />

    <span
      :data-label="label"
      :class="computedClasses"
      :style="{ '--chip-size': getCssUnitValue(size) }"
    />
  </div>
</template>

<style>
.pxd-chip--label::after {
  display: block;
  content: attr(data-label);
  transform: scale(0.875);
  padding-inline: 2px;
}
</style>
