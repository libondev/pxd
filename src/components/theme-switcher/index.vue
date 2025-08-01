<script lang="ts" setup>
import type { ColorScheme } from './useDark'
import MoonIcon from '@gdsicon/vue/moon'
import SunIcon from '@gdsicon/vue/sun'
import { computed, watch } from 'vue'
import PButton from '../button/index.vue'
import { useDark } from './useDark'

defineOptions({
  name: 'PThemeSwitcher',
  inheritAttrs: false,
})

const emits = defineEmits<{
  toggle: [ColorScheme]
}>()

const { isDark, toggleDark } = useDark()

const renderIcon = computed(() => isDark.value ? SunIcon : MoonIcon)

watch(() => isDark.value, (newVal) => {
  emits('toggle', newVal ? 'dark' : 'light')
}, { immediate: true })
</script>

<template>
  <PButton
    aria-label="Toggle color mode"
    class="pxd-theme-switcher"
    v-bind="$attrs"
    icon
    @click="toggleDark()"
  >
    <component :is="renderIcon" class="size-em" />
  </PButton>
</template>
