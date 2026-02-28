<script lang="ts" setup>
import LogoFigmaIcon from '@gdsicon/vue/logo-figma'
import LogoGeistIcon from '@gdsicon/vue/logo-geist'

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
