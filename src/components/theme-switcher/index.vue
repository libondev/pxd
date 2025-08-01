<script lang="ts" setup>
import DeviceAlternateIcon from '@gdsicon/vue/device-alternate'
import MoonIcon from '@gdsicon/vue/moon'
import SunIcon from '@gdsicon/vue/sun'
import { computed, customRef, onMounted } from 'vue'
import { isServer } from '../../utils/is'
import PButton from '../button/index.vue'

defineOptions({
  name: 'PThemeSwitcher',
  inheritAttrs: false,
})

const emits = defineEmits<{
  toggle: [ColorScheme]
}>()

const colorTransitions = {
  auto: 'dark',
  dark: 'light',
  light: 'auto',
}

type ColorScheme = keyof typeof colorTransitions

function getSystemPreference(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const colorMode = customRef<ColorScheme>((track, trigger) => {
  const storageKey = 'fe.system.color-mode'
  const rootClassList = !isServer
    ? document.documentElement.classList
    : {
        contains: () => false,
        remove: () => {},
        add: () => {},
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

  const savedMode = !isServer ? localStorage.getItem(storageKey) as ColorScheme || 'auto' : 'light'
  let curMode: ColorScheme = savedMode

  if (!isServer) {
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
      if (!isServer) {
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
  colorMode.value = (colorTransitions[colorMode.value] || colorTransitions.auto) as ColorScheme
  emits('toggle', colorMode.value)
}

onMounted(() => {
  if (isServer) {
    return
  }

  const preference = getSystemPreference()

  // 动态调整主题的可选项，只允许在两个模式之间切换，避免偏好和系统一致时需要手动切换两次
  colorTransitions.auto = preference === 'light' ? 'dark' : 'light'
  colorTransitions[colorTransitions.auto as keyof typeof colorTransitions] = 'auto'
})
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
