import { computed, onBeforeUnmount, shallowRef, watchEffect } from 'vue'
import { isServer } from '../utils/is'
import { PRESET_MEDIA_QUERIES, useMediaQuery } from './use-media-query'

export type ColorScheme = 'light' | 'dark'
export type ColorPreference = ColorScheme | 'auto'

export function useColorScheme() {
  const STORAGE_KEY = 'fe.system.color-scheme'

  const colorScheme = shallowRef<ColorPreference>('auto')
  const preferredDark = useMediaQuery(PRESET_MEDIA_QUERIES.COLOR_SCHEME_DARK)

  let removeStyleTimer: ReturnType<typeof setTimeout> | null
  let disableTransitionStyleEl: HTMLStyleElement
  const DISABLE_TRANSITION_CSS = `*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`

  const isDark = computed(() => {
    if (colorScheme.value === 'dark') {
      return true
    }
    if (colorScheme.value === 'light') {
      return false
    }
    return preferredDark.value
  })

  function updateStorages() {
    localStorage.setItem(STORAGE_KEY, colorScheme.value)
  }

  function createDisableTransitionStyle() {
    if (!disableTransitionStyleEl) {
      disableTransitionStyleEl = document.createElement('style')
      disableTransitionStyleEl.appendChild(document.createTextNode(DISABLE_TRANSITION_CSS))
    }

    if (!removeStyleTimer) {
      document.head.appendChild(disableTransitionStyleEl)
    }
  }

  function removeDisableTransitionStyle() {
    if (removeStyleTimer) {
      clearTimeout(removeStyleTimer)
    }

    removeStyleTimer = setTimeout(() => {
      document.head.removeChild(disableTransitionStyleEl)
      removeStyleTimer = null
    }, 0)
  }

  function toggleDarkMode() {
    createDisableTransitionStyle()

    if (colorScheme.value === 'auto') {
      colorScheme.value = isDark.value ? 'light' : 'dark'
    } else {
      colorScheme.value = 'auto'
    }

    updateStorages()
    removeDisableTransitionStyle()
  }

  if (!isServer) {
    const stored = localStorage.getItem(STORAGE_KEY)

    if (stored === 'dark' || stored === 'light' || stored === 'auto') {
      colorScheme.value = stored as ColorPreference
      updateStorages()
    }

    const stopEffect = watchEffect(() => {
      const htmlEl = document.documentElement

      if (isDark.value) {
        htmlEl.classList.add('dark')
      } else {
        htmlEl.classList.remove('dark')
      }
    })

    onBeforeUnmount(() => {
      stopEffect()
    })
  }

  return {
    isDark,
    colorScheme,
    toggleDarkMode,
  }
}
