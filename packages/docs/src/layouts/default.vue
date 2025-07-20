<script setup lang="ts">
import { asideMenus } from '@/consts/components'
import BasicLayout from './components/BasicLayout.vue'
</script>

<template>
  <BasicLayout :menus="asideMenus">
    <RouterView />
  </BasicLayout>
</template>
