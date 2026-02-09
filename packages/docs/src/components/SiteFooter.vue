<script lang="ts" setup>
import LogoFigmaIcon from '@gdsicon/vue/logo-figma'
import LogoGeistIcon from '@gdsicon/vue/logo-geist'
import LogoGithubIcon from '@gdsicon/vue/logo-github'

const LINKS = [
  {
    name: 'Assets',
    children: [
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
    ],
  },
  {
    name: 'Projects',
    children: [
      {
        label: 'VueUse',
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
      {
        label: 'NaiveUI',
        href: 'https://github.com/tusen-ai/naive-ui',
        icon: LogoGithubIcon,
      },
      {
        label: 'es-toolkit',
        href: 'https://github.com/toss/es-toolkit',
        icon: LogoGithubIcon,
      },
    ],
  },
]
</script>

<template>
  <footer class="p-6 gap-4 flex flex-wrap border-t bg-background-200">
    <div v-for="group in LINKS" :key="group.name">
      <div class="text-xl font-medium mb-1 pl-2.75">
        {{ group.name }}
      </div>

      <ul class="max-h-40 gap-x-2 sm:flex-wrap flex flex-col">
        <li v-for="link in group.children" :key="link.href" class="sm:w-auto w-full">
          <PLinkButton variant="ghost" :href="link.href" external-icon target="_blank" full-width>
            <template #prefix>
              <Component :is="link.icon" />
            </template>

            {{ link.label }}
          </PLinkButton>
        </li>
      </ul>
    </div>
  </footer>
</template>
