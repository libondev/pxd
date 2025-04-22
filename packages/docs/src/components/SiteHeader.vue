<script lang="ts" setup>
import { BookOpenIcon, BoxIcon, HomeIcon, LogoGithubIcon } from 'gdsi/vue'

const menus = [
  {
    label: 'Home',
    to: '/',
    icon: HomeIcon,
  },
  {
    label: 'Guide',
    to: '/guide',
    icon: BookOpenIcon,
  },
  {
    label: 'Components',
    to: '/components',
    icon: BoxIcon,
  },
]
</script>

<template>
  <header class="sticky top-0 z-10 border-b bg-background-secondary select-none">
    <div class="container sm:border-x mx-auto h-12 flex items-center">
      <RouterLink v-slot="{ navigate }" to="/" custom>
        <h2 class="px-4.5 h-full flex items-center font-medium cursor-pointer" @click="navigate">
          <SiteLogo class="mr-2 text-2xl" />
          <span>PXD</span>
        </h2>
      </RouterLink>

      <nav class="ml-auto h-full flex [&>*]:border-l [&>*]:list-none">
        <li v-for="menu in menus" :key="menu.to">
          <PLinkButton variant="ghost" class="h-full sm:px-3.5" shape="square" :href="menu.to">
            <span class="hidden sm:block">{{ menu.label }}</span>
            <Component :is="menu.icon" class="block sm:hidden" />
          </PLinkButton>
        </li>

        <li>
          <PLinkButton
            variant="ghost"
            class="h-full sm:px-3.5"
            shape="square"
            target="_blank"
            href="https://github.com/libondev/pxd"
          >
            <LogoGithubIcon />
          </PLinkButton>
        </li>

        <li>
          <ColorMode class="h-full sm:px-3.5" />
        </li>
      </nav>
    </div>
  </header>
</template>
