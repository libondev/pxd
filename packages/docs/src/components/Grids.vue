<script lang="ts" setup>
interface Props {
  data?: any[]
  dataKey: string
}

defineOptions({
  name: 'Grids',
})

defineProps<Props>()
</script>

<template>
  <ul class="grid-list pl-0! md:grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] grid grid-cols-2 border-l">
    <li v-for="item, index of data" :key="item[dataKey]" class="grid-item my-0! list-none border-r" :data-value="item[dataKey]">
      <slot :item="item" :index="index" />
    </li>
  </ul>
</template>

<style lang="postcss">
.grid-list {
  .grid-item {
    border-color: hsl(var(--color-gray-300-value));
    border-style: solid;
  }

  .grid-item:last-child,
  .grid-item:has( + .grid-item) {
    border-bottom-width: 1px
  }
}
</style>
