<script lang="ts" setup>
import type { ColorPreference } from '../../composables/use-color-scheme'
import type { ThemeSwitcherEmits } from './types'
import type { Component } from 'vue'
import DeviceAlternateIcon from '@gdsicon/vue/device-alternate'
import MoonIcon from '@gdsicon/vue/moon'
import SunIcon from '@gdsicon/vue/sun'
import { computed, watch } from 'vue'
import { useColorScheme } from '../../composables/use-color-scheme.js'
import PButton from '../button/index.vue'

defineOptions({
  name: 'PThemeSwitcher',
  inheritAttrs: false,
})

const emits = defineEmits<ThemeSwitcherEmits>()

const { colorScheme, toggleDarkMode } = useColorScheme({
  syncStatus: true,
})

const SCHEME_ICONS: Record<ColorPreference, Component> = {
  auto: DeviceAlternateIcon,
  light: SunIcon,
  dark: MoonIcon,
}

const renderIcon = computed(() => SCHEME_ICONS[colorScheme.value])

watch(
  () => colorScheme.value,
  (newVal) => {
    emits('toggle', newVal)
  },
)
</script>

<template>
  <PButton
    icon
    data-theme-switcher
    aria-label="Toggle color mode"
    class="pxd-theme-switcher"
    v-bind="$attrs"
    @click="toggleDarkMode()"
  >
    <Transition name="pxd-transition--fade-scale" mode="out-in">
      <Component :is="renderIcon" class="size-em" />
    </Transition>
  </PButton>
</template>
