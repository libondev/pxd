<script setup lang="ts">
import DefaultLayout from '@/layouts/default.vue'
import { components } from '@/consts/components'

const menus = components.map(({ name, camelized }) => {
  return {
    label: camelized,
    path: `/components/${name}`,
  }
})
</script>

<template>
  <DefaultLayout :menus="menus">
    <RouterView />
  </DefaultLayout>
</template>
