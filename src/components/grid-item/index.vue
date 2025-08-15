<script lang="ts" setup>
import type { ResponsiveValue } from '../../types/shared'

interface Props {
  row?: ResponsiveValue<string | number>
  column?: ResponsiveValue<string | number>
}

defineOptions({
  name: 'PGridItem',
})

withDefaults(
  defineProps<Props>(),
  {},
)
</script>

<template>
  <div class="pxd-grid-item">
    <slot />
  </div>
</template>
