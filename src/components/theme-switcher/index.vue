<script lang="ts" setup>
import type { ColorScheme } from '../../composables/useColorScheme'
import MoonIcon from '@gdsicon/vue/moon'
import SunIcon from '@gdsicon/vue/sun'
import { computed, watch } from 'vue'
import PButton from '../button/index.vue'
import { useColorScheme } from './../../composables/useColorScheme'

defineOptions({
  name: 'PThemeSwitcher',
  inheritAttrs: false,
})

const emits = defineEmits<{
  toggle: [ColorScheme]
}>()

const { isDark, toggleDarkMode } = useColorScheme()

const renderIcon = computed(() => isDark.value ? MoonIcon : SunIcon)

watch(() => isDark.value, (newVal) => {
  emits('toggle', newVal ? 'dark' : 'light')
})
</script>

<template>
  <PButton
    aria-label="Toggle color mode"
    class="pxd-theme-switcher"
    v-bind="$attrs"
    icon
    @click="toggleDarkMode"
  >
    <component :is="renderIcon" class="size-em" />
  </PButton>
</template>
