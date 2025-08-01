<script lang="ts" setup>
import type { ColorScheme } from './constants'
import DeviceIcon from '@gdsicon/vue/device-alternate'
import MoonIcon from '@gdsicon/vue/moon'
import SunIcon from '@gdsicon/vue/sun'
import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import { isServer } from '../../utils/is'
import PButton from '../button/index.vue'
import { ColorSchemeSystem } from './constants'

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

let colorSchemeSystemInstance: ColorSchemeSystem

const storageKey = 'fe.system.color-scheme'

const colorScheme = shallowRef<ColorScheme>((() => {
  if (isServer) {
    return 'auto'
  }

  return localStorage.getItem(storageKey) as ColorScheme || 'auto'
})())

const renderIcon = computed(() => {
  if (isServer) {
    return DeviceIcon
  }

  if (colorScheme.value === 'light') {
    return SunIcon
  }

  if (colorScheme.value === 'dark') {
    return MoonIcon
  }

  return DeviceIcon
})

function updateNextColorScheme() {
  // 动态调整主题的可选项值，只允许在两个模式之间切换，避免偏好和系统一致时需要手动切换两次
  colorTransitions.auto = colorSchemeSystemInstance.isPreferredDark ? 'light' : 'dark'
  colorTransitions[colorTransitions.auto as keyof typeof colorTransitions] = 'auto'
}

function applySystemTheme(mode: ColorScheme) {
  const rootClassList = document.documentElement.classList

  rootClassList.remove('auto', 'dark', 'light')
  rootClassList.add(mode === 'auto' ? colorSchemeSystemInstance.isPreferredDark ? 'dark' : 'light' : mode)
}

function onToggleColorScheme() {
  colorScheme.value = (colorTransitions[colorScheme.value] || colorTransitions.auto) as ColorScheme
  colorSchemeSystemInstance.emit(colorScheme.value)

  applySystemTheme(colorScheme.value)
  emits('toggle', colorScheme.value)
}

function onPrefersChange(mode: ColorScheme, isManual: boolean) {
  if (isManual) {
    colorScheme.value = mode
    return
  }

  colorScheme.value = 'auto'
  applySystemTheme(mode)
  updateNextColorScheme()
}

watch(() => colorScheme.value, (newMode) => {
  localStorage.setItem(storageKey, newMode)
})

onMounted(() => {
  if (isServer) {
    return
  }

  colorSchemeSystemInstance = new ColorSchemeSystem()
  colorSchemeSystemInstance.on(onPrefersChange)
  applySystemTheme(colorScheme.value)

  updateNextColorScheme()
})

onBeforeUnmount(() => {
  colorSchemeSystemInstance?.off(onPrefersChange)
})
</script>

<template>
  <PButton
    aria-label="Toggle color mode"
    class="pxd-theme-switcher"
    v-bind="$attrs"
    icon
    @click="onToggleColorScheme"
  >
    <component :is="renderIcon" class="size-em" />
  </PButton>
</template>
