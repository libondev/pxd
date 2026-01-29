<script lang="ts" setup>
import ArrowRightIcon from '@gdsicon/vue/arrow-right'
import LogoGithubIcon from '@gdsicon/vue/logo-github'
import MagnifyingGlassIcon from '@gdsicon/vue/magnifying-glass'
import SparklesIcon from '@gdsicon/vue/sparkles'
import { version } from 'pxd'
import { cachedOff, cachedOn } from 'pxd/utils/event'
import { isServer } from 'pxd/utils/is'
import { asideMenus } from '../consts/components'
import CustomVariables from './CustomVariables.vue'

const showCommandMenu = shallowRef(false)
const prereleaseVersion = (() => {
  const versions = version.split('.')
  versions[2] = String(Number(versions[2]) + 1)
  return versions.join('.')
})()

function openCommandMenu() {
  showCommandMenu.value = true
}

function onKeydown(ev: KeyboardEvent) {
  if (!(ev.ctrlKey || ev.metaKey) || ev.key !== 'k') {
    return
  }

  ev.preventDefault()
  openCommandMenu()
}

onMounted(() => {
  if (isServer()) {
    return
  }

  cachedOn(window, 'keydown', onKeydown)
})

onBeforeUnmount(() => {
  cachedOff(window, 'keydown', onKeydown)
})
</script>

<template>
  <header class="top-0 sm:border-t-0 md:max-w-screen-2xl h-12 sticky z-5 mx-auto flex w-full items-center justify-between border-y bg-background-100 select-none max-sm:max-w-full">
    <h2 class="sm:w-60 md:border-r xl:border-l h-full">
      <RouterLink to="/" class="px-3 gap-2 font-medium flex h-full cursor-pointer items-center self-focus-ring outline-none">
        <SiteLogo class="text-2xl" />
        <span>PXD</span>

        <PTooltip content="Internal development version" desktop-only position="bottom-start" z-index="5">
          <PBadge size="sm" variant="gray-subtle">
            v{{ prereleaseVersion }}
          </PBadge>
        </PTooltip>
      </RouterLink>
    </h2>

    <nav class="xl:border-r flex h-full items-center">
      <div class="h-full border-l">
        <PButton variant="ghost" shape="square" class="sm:px-3 h-full" @click="openCommandMenu">
          <MagnifyingGlassIcon />

          <span class="sm:block ml-1.5 hidden">Search</span>

          <template #suffix>
            <PKbd ctrl label="K" size="sm" class="sm:!inline-flex hidden!" />
          </template>
        </PButton>

        <PCommandMenu v-model="showCommandMenu" placeholder="Search...">
          <PCommandMenuGroup v-for="i of asideMenus" :key="i.group" :label="i.group">
            <PCommandMenuItem v-for="e of i.children" :key="e.path" as="RouterLink" :to="e.path">
              <ArrowRightIcon class="text-foreground-secondary" />
              {{ e.label }}
            </PCommandMenuItem>
          </PCommandMenuGroup>

          <template #footer>
            <div class="sm:flex py-2 gap-1 px-3 hidden items-center justify-end border-t bg-background-200">
              <PText secondary class="text-13px">
                Open
              </PText>
              <PKbd enter />

              <div class="mx-3 h-4 border-l" />

              <PText secondary class="text-13px">
                Toggle
              </PText>
              <PKbd label="↑" />
              <PKbd label="↓" />
            </div>
          </template>
        </PCommandMenu>
      </div>

      <div class="h-full border-l">
        <PLinkButton variant="ghost" shape="square" class="sm:px-3 h-full" target="_blank" href="https://github.com/libondev/pxd">
          <LogoGithubIcon />

          <span class="sm:block ml-1.5 hidden">Github</span>
        </PLinkButton>
      </div>

      <div class="h-full border-l">
        <CustomVariables width="200" position="bottom-end">
          <PButton variant="ghost" shape="square" class="sm:px-3 h-full">
            <SparklesIcon />

            <span class="sm:block ml-1.5 hidden">Customize</span>
          </PButton>
        </CustomVariables>
      </div>

      <div class="h-full border-r border-l border-r-transparent">
        <PThemeSwitcher variant="ghost" shape="square" class="sm:px-3 h-full" />
      </div>
    </nav>
  </header>
</template>
