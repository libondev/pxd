<script lang="ts" setup>
import BookOpenIcon from '@gdsicon/vue/book-open'
import BoxIcon from '@gdsicon/vue/box'
import HomeIcon from '@gdsicon/vue/home'
import LogoGithubIcon from '@gdsicon/vue/logo-github'
// import MenuAltIcon from '@gdsicon/vue/menu-alt'

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
  <header class="sticky top-0 z-10 border-b border-t sm:border-t-0 bg-background-secondary select-none">
    <div class="container sm:border-x mx-auto h-12 flex items-center">
      <h2 class="px-3 h-full flex items-center font-medium cursor-pointer">
        <SiteLogo class="mr-2 text-2xl hidden sm:block" />
        <!-- <MenuAltIcon class="block sm:hidden mr-1.5 text-gray-900" /> -->

        <RouterLink to="/" class="hidden sm:inline">
          <span>PXD</span>
        </RouterLink>

        <span class="sm:hidden">PXD</span>
      </h2>

      <nav class="ml-auto h-full">
        <ul class="h-full flex [&>*]:border-l [&>*]:list-none">
          <li v-for="menu in menus" :key="menu.to">
            <PLinkButton variant="ghost" class="h-full sm:px-3" shape="square" :href="menu.to">
              <span class="hidden sm:block">{{ menu.label }}</span>
              <Component :is="menu.icon" class="block sm:hidden" />
            </PLinkButton>
          </li>

          <li>
            <PLinkButton
              variant="ghost"
              aria-label="Jump to GitHub"
              class="h-full sm:px-3"
              shape="square"
              target="_blank"
              href="https://github.com/libondev/pxd"
            >
              <LogoGithubIcon />
            </PLinkButton>
          </li>

          <li>
            <PThemeSwitcher variant="ghost" shape="square" class="h-full sm:px-3" />
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>
