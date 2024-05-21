<script lang="ts" setup>
defineOptions({
  name: 'PxInput',
})

defineProps({
  size: {
    type: String as PropType<Size>,
    default: 'default',
  },
})
</script>

<template>
  <input
    class="pxd-input shadow-sm w-full box-border b-(1 solid input) font-inherit bg-background text-sm outlines file:border-0 file:bg-transparent file:text-sm file:font-medium text-inherit placeholder:(text-gray/500) disabled:(cursor-not-allowed b-transparent bg-secondary)"
    :class="getSize(size)"
  >
</template>
