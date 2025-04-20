<script lang="ts" setup>
const menus = [
  {
    label: 'Home',
    to: '/',
  },
  {
    label: 'About',
    to: '/about',
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

      <nav class="ml-auto h-full flex">
        <div v-for="menu in menus" :key="menu.to" class="border-l">
          <PButton variant="ghost" class="h-full px-3.5" shape="square" :href="menu.to">
            {{ menu.label }}
          </PButton>
        </div>

        <div class="border-l">
          <ColorMode />
        </div>
      </nav>
    </div>
  </header>
</template>
