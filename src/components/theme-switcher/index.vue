<script lang="ts" setup>
import DeviceAlternateIcon from '@gdsicon/vue/device-alternate'
import MoonIcon from '@gdsicon/vue/moon'
import SunIcon from '@gdsicon/vue/sun'
import { computed, customRef } from 'vue'
import { isClient } from '../../utils/is'
import PButton from '../button/index.vue'

interface Props {
  block?: boolean
}

defineOptions({
  name: 'PThemeSwitcher',
  inheritAttrs: false,
})

defineProps<Props>()

const emits = defineEmits<{
  toggle: [ColorScheme]
}>()

const colorTransitions = {
  auto: 'dark',
  dark: 'light',
  light: 'auto',
} as const

type ColorScheme = keyof typeof colorTransitions

const colorMode = customRef<ColorScheme>((track, trigger) => {
  const storageKey = 'fe.system.color-mode'
  const rootClassList = isClient
    ? document.documentElement.classList
    : {
        contains: () => false,
        remove: () => {},
        add: () => {},
      }

  function getSystemPreference(): 'light' | 'dark' {
    return isClient && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  function applyTheme(mode: ColorScheme) {
    if (mode === 'auto') {
      const systemTheme = getSystemPreference()
      rootClassList.remove('dark', 'light')
      rootClassList.add(systemTheme)
    } else {
      rootClassList.remove('dark', 'light', 'auto')
      rootClassList.add(mode)
    }
  }

  const savedMode = isClient ? localStorage.getItem(storageKey) as ColorScheme || 'auto' : 'light'
  let curMode: ColorScheme = savedMode

  if (isClient) {
    applyTheme(curMode)

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', () => {
      if (curMode === 'auto') {
        applyTheme('auto')
        trigger()
      }
    })
  }

  return {
    get() {
      track()
      return curMode
    },
    set(newMode) {
      if (newMode === curMode) {
        return
      }

      applyTheme(newMode)
      if (isClient) {
        localStorage.setItem(storageKey, newMode)
      }
      curMode = newMode

      trigger()
    },
  }
})

const RenderIcon = computed(() => {
  if (colorMode.value === 'light') {
    return SunIcon
  }

  if (colorMode.value === 'dark') {
    return MoonIcon
  }

  return DeviceAlternateIcon
})

function toggleColorMode() {
  colorMode.value = colorTransitions[colorMode.value] || colorTransitions.auto
  emits('toggle', colorMode.value)
}
</script>

<template>
  <PButton
    aria-label="Toggle color mode"
    class="pxd-theme-switcher"
    v-bind="$attrs"
    @click="toggleColorMode"
  >
    <component :is="RenderIcon" class="size-em" />
  </PButton>
</template>
