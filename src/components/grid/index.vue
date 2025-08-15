<script lang="ts" setup>
interface Props {
  rows?: number
  columns?: number
}

defineOptions({
  name: 'PGrid',
})

withDefaults(
  defineProps<Props>(),
  {
    rows: 1,
    columns: 1,
  },
)
</script>

<template>
  <div class="pxd-grid grid max-w-full">
    <slot />
  </div>
</template>
