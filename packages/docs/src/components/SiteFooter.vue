<script lang="ts" setup>
import LogoFigmaIcon from '@gdsicon/vue/logo-figma'
import LogoGeistIcon from '@gdsicon/vue/logo-geist'
import LogoGithubIcon from '@gdsicon/vue/logo-github'

const links = [
  {
    label: 'PXD Github',
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
  {
    label: 'Vue Use',
    href: 'https://github.com/vueuse/vueuse',
    icon: LogoGithubIcon,
  },
  {
    label: 'Arco Design Vue',
    href: 'https://github.com/arco-design/arco-design-vue',
    icon: LogoGithubIcon,
  },
  {
    label: 'Element Plus',
    href: 'https://github.com/element-plus/element-plus',
    icon: LogoGithubIcon,
  },
]
</script>

<template>
  <footer class="border-t border-r p-6 bg-background-secondary">
    <ul class="max-w-50">
      <li class="text-xl font-medium mb-1 pl-[11px]">
        Links
      </li>

      <li v-for="link in links" :key="link.href">
        <PLinkButton variant="ghost" :href="link.href" external-icon target="_blank" block>
          <template #prefix>
            <component :is="link.icon" />
          </template>

          {{ link.label }}
        </PLinkButton>
      </li>
    </ul>
  </footer>
</template>
