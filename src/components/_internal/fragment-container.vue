<script lang="ts" setup>
defineOptions({
  name: 'PFragmentContainer',
  inheritAttrs: false,
})
</script>

<template>
  <div data-fragment-container class="pxd-fragment-container" v-bind="$attrs">
    <slot />
  </div>
</template>
