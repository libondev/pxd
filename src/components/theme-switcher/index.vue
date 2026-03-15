<script lang="ts" setup>
import type { ThemeSwitcherEmits } from './types'
import MoonIcon from '@gdsicon/vue/moon'
import SunIcon from '@gdsicon/vue/sun'
import { computed, watch } from 'vue'
import { useColorScheme } from '../../composables/use-color-scheme'
import PButton from '../button/index.vue'

defineOptions({
  name: 'PThemeSwitcher',
  inheritAttrs: false,
})

const emits = defineEmits<ThemeSwitcherEmits>()

const { isDark, toggleDarkMode } = useColorScheme({
  syncStatus: true,
})

const renderIcon = computed(() => (isDark.value ? MoonIcon : SunIcon))

watch(
  () => isDark.value,
  (newVal) => {
    emits('toggle', newVal ? 'dark' : 'light')
  },
)
</script>

<template>
  <PButton
    aria-label="Toggle color mode"
    class="pxd-theme-switcher"
    v-bind="$attrs"
    icon
    @click="toggleDarkMode"
  >
    <Component :is="renderIcon" class="size-em" />
  </PButton>
</template>
