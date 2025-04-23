<script setup lang="ts">
import DefaultLayout from '@/layouts/default.vue'

const menus = [
  {
    label: 'Button',
    path: '/components/button',
  },
]
</script>

<template>
  <DefaultLayout :menus="menus">
    <RouterView />
  </DefaultLayout>
</template>
