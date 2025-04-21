<script lang="ts" setup>
import { LogoGithubIcon } from 'gdsi/vue'

const links = [
  {
    label: 'Github',
    href: 'https://github.com/pxd-design/pxd',
    icon: LogoGithubIcon,
  },
]
</script>

<template>
  <footer class="border-t bg-background-secondary">
    <div class="container mx-auto p-6">
      <ul>
        <li class="text-xl font-medium mb-1">Links</li>
        <li v-for="link in links" :key="link.href">
          <a :href="link.href" target="_blank" class="flex items-center gap-1.5 px-1">
            <component :is="link.icon" />
            <span>{{ link.label }}</span>
          </a>
        </li>
      </ul>
    </div>
  </footer>
</template>
