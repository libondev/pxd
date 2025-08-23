<script lang="ts" setup>
import BookOpenIcon from '@gdsicon/vue/book-open'
import LogoGithubIcon from '@gdsicon/vue/logo-github'
import MagnifyingGlassIcon from '@gdsicon/vue/magnifying-glass-small'
import { off, on } from 'pxd/utils/event'
import { isServer } from 'pxd/utils/is'
import { asideMenus } from '../consts/components'

const menus = [
  {
    label: 'Docs',
    href: '/guide/introduction',
    target: undefined,
    icon: BookOpenIcon,
  },
  {
    label: 'Github',
    href: 'https://github.com/libondev/pxd',
    target: '_blank',
    icon: LogoGithubIcon,
  },
] as const

const showCommandMenu = shallowRef(false)

function openCommandMenu() {
  showCommandMenu.value = true
}

function onKeydown(ev: KeyboardEvent) {
  if (!ev.ctrlKey || ev.key !== 'k') {
    return
  }

  ev.preventDefault()
  openCommandMenu()
}

onMounted(() => {
  if (isServer) {
    return
  }

  on(window, 'keydown', onKeydown)
})

onBeforeUnmount(() => {
  off(window, 'keydown', onKeydown)
})
</script>

<template>
  <header class="top-0 sm:border-t-0 sticky z-10 border-y bg-background-100 select-none">
    <div class="md:max-w-screen-2xl h-12 mx-auto flex w-full max-w-full items-center justify-between">
      <h2 class="sm:w-55 sm:border-x h-full">
        <RouterLink to="/" class="px-3 font-medium flex h-full cursor-pointer items-center self-focus-ring outline-none">
          <SiteLogo class="mr-2 text-2xl" />
          <span>PXD</span>
        </RouterLink>
      </h2>

      <div class="px-3 sm:block hidden">
        <PButton class="px-2 text-foreground-secondary" size="sm" @click="openCommandMenu">
          <template #prefix>
            <MagnifyingGlassIcon />
          </template>

          <span class="pr-6">Search</span>

          <template #suffix>
            <PKbd ctrl label="K" size="sm" />
          </template>
        </PButton>
      </div>

      <nav class="sm:border-r ml-auto flex h-full items-center">
        <ul class="flex h-full [&>*]:list-none [&>*]:border-l">
          <li class="sm:hidden">
            <PButton variant="ghost" shape="square" class="sm:px-3 h-full" @click="openCommandMenu">
              <MagnifyingGlassIcon />
              <span class="sm:block ml-1.5 hidden">Search</span>
              <PKbd class="sm:!inline-flex ml-1.5 !hidden" ctrl label="K" size="sm" />
            </PButton>
          </li>

          <li v-for="menu in menus" :key="menu.href">
            <PLinkButton variant="ghost" class="sm:px-3 h-full" shape="square" :target="menu.target" :href="menu.href">
              <Component :is="menu.icon" />
              <span class="sm:block ml-1.5 hidden">{{ menu.label }}</span>
            </PLinkButton>
          </li>

          <li>
            <PThemeSwitcher variant="ghost" shape="square" class="sm:px-3 h-full" />
          </li>
        </ul>
      </nav>

      <PCommandMenu v-model="showCommandMenu" placeholder="Search...">
        <PCommandMenuGroup v-for="i of asideMenus" :key="i.group" :label="i.group">
          <PCommandMenuItem v-for="e of i.children" :key="e.path" :label="e.label" as="RouterLink" :to="e.path" />
        </PCommandMenuGroup>
      </PCommandMenu>
    </div>
  </header>
</template>
