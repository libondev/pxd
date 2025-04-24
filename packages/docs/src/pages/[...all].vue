<script setup lang="ts">
import DefaultLayout from '@/layouts/default.vue'
import { ArrowLeftIcon } from 'gdsi/vue'

const menus = [
  { label: 'Home', path: '/' },
  { label: 'Guide', path: '/guide' },
  { label: 'Components', path: '/components' },
]
</script>

<template>
  <DefaultLayout :menus="menus">
    <div class="flex flex-col items-center justify-center h-full">
      <h1 class="text-2xl font-bold !mb-8">
        404 Not Found
      </h1>

      <PLinkButton href="/components">
        <template #prefix>
          <ArrowLeftIcon />
        </template>

        Back Components Page
      </PLinkButton>
    </div>
  </DefaultLayout>
</template>
