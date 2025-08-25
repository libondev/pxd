<script lang="ts" setup>
import PListItem from '../list-item/index.vue'

defineOptions({
  name: 'PCommandMenuItem',
  inheritAttrs: false,
})
</script>

<template>
  <PListItem v-bind="$attrs">
    <slot />
  </PListItem>
</template>
