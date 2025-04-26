<script setup lang="ts">
import { components } from '@/consts/components'
import DefaultLayout from '@/layouts/default.vue'

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
