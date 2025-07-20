<script lang="ts" setup>
import BookOpenIcon from '@gdsicon/vue/book-open'
import LogoGithubIcon from '@gdsicon/vue/logo-github'

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
</script>

<template>
  <header class="sticky top-0 z-10 border-b bg-background select-none">
    <div class="w-full max-w-full md:max-w-screen-2xl mx-auto h-12 flex items-center">
      <h2 class="h-full border-l sm:w-60 sm:border-r">
        <RouterLink to="/" class="px-3 h-full flex items-center font-medium cursor-pointer">
          <SiteLogo class="mr-2 text-2xl " />
          <span>PXD</span>
        </RouterLink>
      </h2>

      <nav class="ml-auto h-full border-r">
        <ul class="h-full flex [&>*]:border-l [&>*]:list-none">
          <li v-for="menu in menus" :key="menu.href">
            <PLinkButton variant="ghost" class="h-full sm:px-3" shape="square" :target="menu.target" :href="menu.href">
              <Component :is="menu.icon" />
              <span class="hidden sm:block ml-1.5">{{ menu.label }}</span>
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
