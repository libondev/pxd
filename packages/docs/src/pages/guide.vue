<script setup lang="ts">
import DefaultLayout from '@/layouts/default.vue'

const menus = [
  {
    label: 'Guide',
    path: '/guide',
  },
]
</script>

<template>
  <DefaultLayout :menus="menus">
    <RouterView />
  </DefaultLayout>
</template>
