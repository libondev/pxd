import { computed, onScopeDispose, shallowRef, watchEffect } from 'vue'
import { cachedOn } from '../utils/event.js'
import { getUniqueId } from '../utils/helper.js'
import { isServer } from '../utils/is.js'
import { PRESET_MEDIA_QUERIES, useMediaQuery } from './use-media-query.js'

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
  const uniqueId = getUniqueId()
  const EVENT_NAME = '#toggle-color-scheme'
  const STORAGE_KEY = 'fe.system.color-scheme'

  const colorScheme = shallowRef<ColorPreference>('auto')
  const preferredDark = useMediaQuery(PRESET_MEDIA_QUERIES.COLOR_SCHEME_DARK)

  const styleHandles: {
    removeStyleTimer: ReturnType<typeof setTimeout> | null
    disableTransitionStyleEl: HTMLStyleElement | null
  } = { removeStyleTimer: null, disableTransitionStyleEl: null }
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
    if (styleHandles.removeStyleTimer) {
      clearTimeout(styleHandles.removeStyleTimer)
      styleHandles.removeStyleTimer = null
    }

    if (!styleHandles.disableTransitionStyleEl) {
      const styleEl = document.createElement('style')
      styleEl.appendChild(document.createTextNode(DISABLE_TRANSITION_CSS))
      styleHandles.disableTransitionStyleEl = styleEl
    }

    if (styleHandles.disableTransitionStyleEl.parentElement !== document.head) {
      document.head.appendChild(styleHandles.disableTransitionStyleEl)
    }
  }

  function removeDisableTransitionStyle() {
    if (styleHandles.removeStyleTimer) {
      clearTimeout(styleHandles.removeStyleTimer)
    }

    styleHandles.removeStyleTimer = setTimeout(() => {
      const styleEl = styleHandles.disableTransitionStyleEl

      if (styleEl && styleEl.parentElement === document.head) {
        document.head.removeChild(styleEl)
      }
      styleHandles.removeStyleTimer = null
    }, 0)
  }

  function cleanupStyleElements() {
    if (styleHandles.removeStyleTimer) {
      clearTimeout(styleHandles.removeStyleTimer)
      styleHandles.removeStyleTimer = null
    }

    const styleEl = styleHandles.disableTransitionStyleEl

    if (styleEl && styleEl.parentElement === document.head) {
      document.head.removeChild(styleEl)
    }
    styleHandles.disableTransitionStyleEl = null
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

    // Keep all theme-switcher components internally in sync.
    if (options.syncStatus) {
      const payload = { id: uniqueId, mode: colorScheme.value }

      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: payload }))
    }
  }

  function onToggleModeType({ detail }: CustomEvent<Subscriber>) {
    if (detail.id === uniqueId) {
      return
    }

    colorScheme.value = detail.mode
  }

  if (!isServer()) {
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

    let unbindSubscriber = () => {}

    if (options.syncStatus) {
      unbindSubscriber = cachedOn(window, EVENT_NAME, onToggleModeType)
    }

    onScopeDispose(() => {
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
