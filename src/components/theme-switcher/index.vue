<script lang="ts" setup>
import type { ThemeSwitcherEmits } from './types'
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

const { colorScheme, isDark, toggleDarkMode } = useColorScheme({
  syncStatus: true,
})

const renderIcon = computed(() => {
  if (colorScheme.value === 'auto') {
    return DeviceAlternateIcon
  }

  return isDark.value ? MoonIcon : SunIcon
})

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
    <span class="grid shrink-0">
      <Transition name="pxd-transition--fade-scale">
        <Component :is="renderIcon" class="col-start-1 row-start-1 size-em" />
      </Transition>
    </span>
  </PButton>
</template>
