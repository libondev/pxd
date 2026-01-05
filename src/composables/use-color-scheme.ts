import { computed, onBeforeUnmount, shallowRef, watchEffect } from 'vue'
import { on } from '../utils/event'
import { isServer } from '../utils/is'
import { PRESET_MEDIA_QUERIES, useMediaQuery } from './use-media-query'

export type ColorScheme = 'light' | 'dark'
export type ColorPreference = ColorScheme | 'auto'

interface Options {
  syncStatus?: boolean
}

interface Subscriber {
  id: number | string
  mode: ColorPreference
}

export function useColorScheme(options: Options = {}) {
  const RANDOM_KEY = Math.random()
  const EVENT_NAME = '#toggle-color-scheme'
  const STORAGE_KEY = 'fe.system.color-scheme'

  const colorScheme = shallowRef<ColorPreference>('auto')
  const preferredDark = useMediaQuery(PRESET_MEDIA_QUERIES.COLOR_SCHEME_DARK)

  let removeStyleTimer: ReturnType<typeof setTimeout> | null = null
  let disableTransitionStyleEl: HTMLStyleElement | null = null
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
    if (removeStyleTimer) {
      clearTimeout(removeStyleTimer)
      removeStyleTimer = null
    }

    if (!disableTransitionStyleEl) {
      disableTransitionStyleEl = document.createElement('style')
      disableTransitionStyleEl.appendChild(document.createTextNode(DISABLE_TRANSITION_CSS))
    }

    if (disableTransitionStyleEl.parentElement !== document.head) {
      document.head.appendChild(disableTransitionStyleEl)
    }
  }

  function removeDisableTransitionStyle() {
    if (removeStyleTimer) {
      clearTimeout(removeStyleTimer)
    }

    removeStyleTimer = setTimeout(() => {
      if (disableTransitionStyleEl && disableTransitionStyleEl.parentElement === document.head) {
        document.head.removeChild(disableTransitionStyleEl)
      }
      removeStyleTimer = null
    }, 0)
  }

  function cleanupStyleElements() {
    if (removeStyleTimer) {
      clearTimeout(removeStyleTimer)
      removeStyleTimer = null
    }

    if (disableTransitionStyleEl && disableTransitionStyleEl.parentElement === document.head) {
      document.head.removeChild(disableTransitionStyleEl)
    }
    disableTransitionStyleEl = null
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

    // 同步所有 theme-switcher 组件内部状态
    if (options.syncStatus) {
      const payload = { id: RANDOM_KEY, mode: colorScheme.value }

      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: payload }))
    }
  }

  function onToggleModeType({ detail }: CustomEvent<Subscriber>) {
    if (detail.id === RANDOM_KEY) {
      return
    }

    colorScheme.value = detail.mode
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

    let unbindSubscriber = () => { }

    if (options.syncStatus) {
      unbindSubscriber = on(window, EVENT_NAME, onToggleModeType)
    }

    onBeforeUnmount(() => {
      stopEffect()
      unbindSubscriber()
      cleanupStyleElements()
    })
  }

  return {
    isDark,
    colorScheme,
    toggleDarkMode,
  }
}
