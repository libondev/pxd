<script setup lang="ts">
import { asideMenus } from '@/consts/components'
import DefaultLayout from '@/layouts/default.vue'
</script>

<template>
  <DefaultLayout :menus="asideMenus">
    <RouterView />
  </DefaultLayout>
</template>
