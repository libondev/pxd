<script setup lang="ts">
import DefaultLayout from '@/layouts/default.vue'
import { camelize } from 'vue'

function pascalize(name: string) {
  const camelized = camelize(name)
  return camelized.charAt(0).toUpperCase() + camelized.slice(1)
}

const glob = import.meta.glob([
  './components/**/*.md',
  '!./components/index.md',
], { eager: true })

const menus = Object.keys(glob).map((path) => {
  const name = path.split('/').pop()!.replace('.md', '')

  return {
    label: pascalize(name),
    path: `/components/${name}`,
  }
})
</script>

<template>
  <DefaultLayout :menus="menus">
    <RouterView />
  </DefaultLayout>
</template>
