<script lang="ts" setup>
defineOptions({
  name: 'PLabel',
  inheritAttrs: false,
})
</script>

<template>
  <label class="pxd-label mb-1 text-sm flex w-full max-w-full text-gray-900" v-bind="$attrs">
    <slot />
  </label>
</template>
