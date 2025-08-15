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
  <header class="top-0 sm:border-t-0 sticky z-10 border-y bg-background-100 select-none">
    <div class="md:max-w-screen-2xl h-12 mx-auto flex w-full max-w-full items-center">
      <h2 class="sm:w-60 sm:border-r h-full border-l">
        <RouterLink to="/" class="px-3 font-medium flex h-full cursor-pointer items-center self-focus-ring outline-none">
          <SiteLogo class="mr-2 text-2xl" />
          <span>PXD</span>
        </RouterLink>
      </h2>

      <nav class="ml-auto h-full border-r">
        <ul class="flex h-full [&>*]:list-none [&>*]:border-l">
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
    </div>
  </header>
</template>
