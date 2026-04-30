<script lang="ts" setup>
import type { ComponentPosition } from '../../types/shared'

interface Props {
  position?: ComponentPosition
}

defineOptions({
  name: 'PPopoverArrow',
  inheritAttrs: false,
})

withDefaults(defineProps<Props>(), {
  position: 'bottom',
})
</script>

<template>
  <svg
    width="14"
    height="7"
    viewBox="0 0 14 7"
    xmlns="http://www.w3.org/2000/svg"
    class="pxd-popover-arrow"
    :data-position="position"
    v-bind="$attrs"
  >
    <g clip-path="url(#popover_arrow_clip)">
      <path
        d="M15 -0.5V0.5H12.9834L12.8184 0.508789C12.4377 0.550822 12.0853 0.738056 11.8359 1.03418L8.53027 4.95996C7.73114 5.90893 6.26886 5.90892 5.46973 4.95996L2.16406 1.03418C1.87905 0.695733 1.45907 0.5 1.0166 0.5H-1V-0.5H15Z"
        fill="inherit"
        stroke="inherit"
      />
    </g>
    <defs>
      <clipPath id="popover_arrow_clip">
        <rect width="14" height="7" fill="inherit" />
      </clipPath>
    </defs>
  </svg>
</template>

<style>
.pxd-popover-arrow[data-position^='bottom'] {
  transform: rotate(180deg);
}
.pxd-popover-arrow[data-position^='left'] {
  transform: translateX(4px) rotate(-90deg);
}
.pxd-popover-arrow[data-position^='right'] {
  transform: translateX(-4px) rotate(90deg);
}
</style>
