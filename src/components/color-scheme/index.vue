<script lang="ts" setup>
import { MoonIcon, SunIcon } from 'gdsi/vue'
import { customRef } from 'vue'
import Button from '../button/index.vue'

const emits = defineEmits<{
  toggle: [v: ColorScheme]
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
      if (newMode === curMode)
        return

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
  <Button aria-label="Toggle color mode" @click="toggleColorMode">
    <Transition name="color-mode" mode="out-in">
      <Component :is="colorMode === 'light' ? SunIcon : MoonIcon" class="size-[1em]" />
      <!-- <SunIcon v-if="colorMode === 'light'" class="size-[1em]" />
      <MoonIcon v-else class="size-[1em]" /> -->
    </Transition>
  </Button>
</template>

<style>
.color-mode-enter-active,
.color-mode-leave-active {
  transition: transform 0.15s ease;
}

.color-mode-enter-from {
  transform: rotate(-45deg) scale(0.68);
}

.color-mode-leave-to {
  transform: rotate(45deg) scale(0.68);
}
</style>
