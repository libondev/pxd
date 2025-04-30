<script lang="ts" setup>
import LogoGeistIcon from 'gdsi/vue/logo-geist'
import LogoGithubIcon from 'gdsi/vue/logo-github'
import LogoFigmaIcon from 'gdsi/vue/logo-figma'

const links = [
  {
    label: 'Github',
    href: 'https://github.com/libondev/pxd',
    icon: LogoGithubIcon,
  },
  {
    label: 'Geist Design System',
    href: 'https://vercel.com/geist/introduction',
    icon: LogoGeistIcon,
  },
  {
    label: 'Geist Design System',
    href: 'https://www.figma.com/community/file/1330020847221146106/geist-design-system-vercel',
    icon: LogoFigmaIcon,
  },
]
</script>

<template>
  <footer class="border-t border-r p-6 bg-background-secondary">
    <ul class="max-w-[200px]">
      <li class="text-xl font-medium mb-1 pl-[11px]">
        Links
      </li>

      <li v-for="link in links" :key="link.href">
        <PLinkButton variant="ghost" :href="link.href" external-icon class="justify-start" target="_blank" block>
          <template #prefix>
            <component :is="link.icon" />
          </template>

          {{ link.label }}
        </PLinkButton>
      </li>
    </ul>
  </footer>
</template>
