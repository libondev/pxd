<script lang="ts" setup>
import { asideMenus } from '@/consts/navbar'
import BasicLayout from './components/BasicLayout.vue'
</script>

<template>
  <BasicLayout :menus="asideMenus">
    <RouterView />
  </BasicLayout>
</template>
