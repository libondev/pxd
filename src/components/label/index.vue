<script lang="ts" setup>
defineOptions({
  name: 'PLabel',
  inheritAttrs: false,
})
</script>

<template>
  <label class="pxd-label pb-2 text-sm max-w-full leading-none text-foreground-secondary" v-bind="$attrs">
    <slot />
  </label>
</template>
