<script lang="ts" setup>
import BoxIcon from '@gdsicon/vue/box'
import LogoGithubIcon from '@gdsicon/vue/logo-github'

const menus = [
  {
    label: 'Documentation',
    to: '/guide',
    icon: BoxIcon,
  },
]
</script>

<template>
  <header class="sticky top-0 z-10 border-b border-t sm:border-t-0 bg-background-secondary select-none">
    <div class="w-full max-w-full md:max-w-screen-2xl sm:border-x mx-auto h-12 flex items-center">
      <h2>
        <RouterLink to="/" class="px-3 h-full flex items-center font-medium cursor-pointer">
          <SiteLogo class="mr-2 text-2xl " />
          <span>PXD</span>
        </RouterLink>
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
