<script setup lang="ts">
import type { RouteRecordRaw } from 'vue-router'

import { GithubLogoIcon, MoonIcon, SunIcon } from '@radix-icons/vue'

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
}, [] as RouteRecordRaw[]).sort((a, b) => (a.name as string).localeCompare(b.name as string))

const isDark = useDark({ storageKey: 'pxd-ui-theme' })
const toggleDarkMode = useToggle(isDark)

watchEffect(() => {
  document.documentElement.classList.toggle('dark', isDark.value)
})
</script>

<template>
  <div class="flex flex-col max-w-screen-xl mx-auto h-full">
    <header class="sticky top-0 left-0 h-16 z-10 bg-background-100 flex items-center justify-between border border-t-0">
      <div class="flex items-center h-full pl-6 text-lg font-semibold tracking-tight w-60 border-r">
        <span class="logo inline-block size-7 bg-gray-1000 mr-3" />
        <RouterLink to="/">
          PXD UI
        </RouterLink>
      </div>

      <div class="p-4 flex gap-1.5">
        <PButton variant="outline" icon @click="toggleDarkMode()">
          <MoonIcon v-if="isDark" />
          <SunIcon v-else />
        </PButton>

        <PLink href="https://github.com/libondev/pxd" external :with-icon="false" tabindex="-1">
          <PButton variant="outline" icon>
            <GithubLogoIcon />
          </PButton>
        </PLink>
      </div>
    </header>

    <div class="relative h-full flex-1 flex border-l border-r transform-gpu ">
      <aside class="capitalize sticky left-0 top-16 bottom-0 p-2 border-r select-none w-60 min-w-60 space-y-0.5 overflow-y-auto h-[calc(100vh-4rem)]">
        <PLink href="/introduction" class="text-sm mb-0.5  w-full py-2 px-3 rounded font-normal cursor-default hover:bg-gray-100 active:bg-gray-alpha-200">
          introduction
        </PLink>

        <div class="px-3 !my-2 text-xs font-medium text-gray-600">
          COMPONENTS
        </div>

        <template v-for="item of components" :key="item.path">
          <PLink
            :href="item.path"
            class="w-full py-2 px-3 rounded text-sm font-normal cursor-default hover:bg-gray-100 active:bg-gray-alpha-200"
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
  animation: logo-animation 8s infinite linear;
  animation-direction: alternate-reverse
}
</style>
