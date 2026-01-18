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
  <ul class="pxd-grids md:grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] grid grid-cols-2 border-t border-l">
    <li v-for="item, index of data" :key="item[dataKey]" :data-value="item[dataKey]" class="my-0! list-none border-r border-b">
      <slot :item="item" :index="index" />
    </li>
  </ul>
</template>
