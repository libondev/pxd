<script lang="ts" setup>
import { LogoGithubIcon } from 'gdsi/vue'

const menus = [
  {
    label: 'Home',
    to: '/',
  },
  {
    label: 'Guide',
    to: '/guide',
  },
  {
    label: 'Components',
    to: '/components',
  },
]
</script>

<template>
  <header class="border-b select-none">
    <div class="container sm:border-x mx-auto h-12 flex items-center">
      <RouterLink v-slot="{ navigate }" to="/" custom>
        <h2 class="px-4.5 h-full flex items-center font-medium cursor-pointer" @click="navigate">
          <SiteLogo class="mr-2" />
          PXD
        </h2>
      </RouterLink>

      <nav class="ml-auto h-full flex [&>*]:border-l [&>*]:list-none">
        <li v-for="menu in menus" :key="menu.to">
          <PButton variant="ghost" class="h-full px-3.5" shape="square" :href="menu.to">
            {{ menu.label }}
          </PButton>
        </li>

        <li>
          <PButton
            variant="ghost"
            class="h-full px-3.5"
            shape="square"
            target="_blank"
            href="https://github.com/libondev/pxd"
          >
            <LogoGithubIcon />
          </PButton>
        </li>

        <li>
          <ColorMode />
        </li>
      </nav>
    </div>
  </header>
</template>
