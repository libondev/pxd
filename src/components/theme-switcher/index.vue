<script lang="ts" setup>
import MoonIcon from '@gdsicon/vue/moon'
import SunIcon from '@gdsicon/vue/sun'
import { customRef } from 'vue'
import PButton from '../button/index.vue'

interface Props {
  block?: boolean
}

defineOptions({
  name: 'PThemeSwitcher',
})

defineProps<Props>()

const emits = defineEmits<{
  toggle: [ColorScheme]
}>()

const colorTransitions = {
  dark: 'light',
  light: 'dark',
} as const

type ColorScheme = keyof typeof colorTransitions

const colorMode = customRef<ColorScheme>((track, trigger) => {
  const storageKey = 'fe.system.color-mode'
  const rootClassList = document.documentElement.classList
  let curMode: ColorScheme = rootClassList.contains('dark') ? 'dark' : 'light'

  return {
    get() {
      track()
      return curMode
    },
    set(newMode) {
      if (newMode === curMode) {
        return
      }

      rootClassList.remove(curMode)
      rootClassList.add(newMode)

      localStorage.setItem(storageKey, newMode)
      curMode = newMode

      trigger()
    },
  }
})

function toggleColorMode() {
  colorMode.value = colorTransitions[colorMode.value]
  emits('toggle', colorMode.value)
}
</script>

<template>
  <PButton
    aria-label="Toggle color mode"
    :block="block"
    class="pxd-theme-switcher"
    v-bind="$attrs"
    @click="toggleColorMode"
  >
    <Transition name="rotate-scale" mode="out-in">
      <component :is="colorMode === 'light' ? SunIcon : MoonIcon" class="size-em" />
    </Transition>
  </PButton>
</template>

<style>
@media (prefers-reduced-motion: no-preference) {
  .rotate-scale-enter-active,
  .rotate-scale-leave-active {
    transition: transform 0.15s ease-out;
  }

  .rotate-scale-enter-from {
    transform: rotate(-45deg) scale(0.68);
  }

  .rotate-scale-leave-to {
    transform: rotate(45deg) scale(0.68);
  }
}
</style>
