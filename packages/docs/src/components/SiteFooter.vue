<script lang="ts" setup>
import { LogoGithubIcon } from 'gdsi/vue'

const links = [
  {
    label: 'Github',
    href: 'https://github.com/libondev/pxd',
    icon: LogoGithubIcon,
  },
]
</script>

<template>
  <footer class="border-t bg-background-secondary">
    <div class="container border-x mx-auto p-6">
      <ul class="max-w-[200px]">
        <li class="text-xl font-medium mb-1 pl-[11px]">
          Links
        </li>

        <li v-for="link in links" :key="link.href">
          <PButton variant="ghost" :href="link.href" class="justify-start" target="_blank" block>
            <template #prefix>
              <component :is="link.icon" />
            </template>

            <span>{{ link.label }}</span>
          </PButton>
        </li>
      </ul>
    </div>
  </footer>
</template>
