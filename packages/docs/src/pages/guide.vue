<script setup lang="ts">
import DefaultLayout from '@/layouts/default.vue'

const menus = [
  // {
  //   label: 'Why',
  //   path: '/guide/why',
  // },
  // {
  //   label: 'Problems',
  //   path: '/guide/problems',
  // },
  {
    label: 'Installation',
    path: '/guide/installation',
  },
]
</script>

<template>
  <DefaultLayout :menus="menus">
    <RouterView />
  </DefaultLayout>
</template>
