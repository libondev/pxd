<script setup lang="ts">
import type { RouteRecordRaw } from 'vue-router'

import { MoonIcon, SunIcon } from '@radix-icons/vue'

import { useDark, useToggle } from '@vueuse/core'

import routes from '~pages'
import { watchEffect } from 'vue'

const components = routes.reduce((list, route) => {
  if (route.path.startsWith('/components')) {
    route.meta = {
      title: (route.name as string).replace('components-', ''),
    }

    list.push(route)
  }

  return list
}, [] as RouteRecordRaw[])

const isDark = useDark({ storageKey: 'pxd-ui-theme' })
const toggleDarkMode = useToggle(isDark)

watchEffect(() => {
  document.documentElement.classList.toggle('dark', isDark.value)
})
</script>

<template>
  <div class="flex flex-col max-w-screen-xl mx-auto h-full">
    <header class="sticky top-0 left-0 h-16 bg-background-100 flex items-center justify-between border border-t-0">
      <h2 class="flex items-center h-full pl-6 text-lg font-semibold tracking-tight w-60 border-r">
        <span class="logo inline-block size-7 bg-gray-1000 mr-3" />
        <RouterLink to="/">
          PXD UI
        </RouterLink>
      </h2>

      <div class="p-4 flex gap-2">
        <PButton variant="outline" icon @click="toggleDarkMode()">
          <MoonIcon v-if="isDark" />
          <SunIcon v-else />
        </PButton>
      </div>
    </header>

    <div class="relative h-full flex-1 flex border-l border-r transform-gpu">
      <aside class="sticky left-0 top-16 bottom-0 p-2 border-r select-none w-60 min-w-60 bg-background-100 space-y-1 overflow-y-auto">
        <PLink href="/introduction" class="mb-0.5 capitalize w-full py-1.5 px-3 rounded font-normal cursor-default hover:bg-gray-100 active:bg-gray-alpha-200">
          introduction
        </PLink>

        <div class="px-3 text-xs font-medium text-gray-600">
          COMPONENTS
        </div>

        <template v-for="item of components" :key="item.path">
          <PLink
            :href="item.path"
            class="capitalize w-full py-1.5 px-3 rounded font-normal cursor-default hover:bg-gray-100 active:bg-gray-alpha-200"
          >
            {{ item.meta?.title }}
          </PLink>
        </template>
      </aside>

      <div class="w-full h-full pb-40">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes logo-animation {
  0% {
    border-radius: 0
  }

  100% {
    border-radius: 50%;
    transform: rotate(360deg);
  }
}

.logo {
  animation: logo-animation 3s infinite linear;
  animation-direction: alternate-reverse
}
</style>
