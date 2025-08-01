import { computed, shallowRef, watch, watchEffect } from 'vue'
import { isServer } from '../../utils/is'

export type ColorScheme = 'light' | 'dark'
export type ColorPreference = ColorScheme | 'auto'

export function useDark() {
  const STORAGE_KEY = 'fe.system.color-scheme'

  const preference = shallowRef<ColorPreference>('auto')
  const systemIsDark = shallowRef(false)

  const isDark = computed(() => {
    if (preference.value === 'dark') {
      return true
    }
    if (preference.value === 'light') {
      return false
    }
    return systemIsDark.value
  })

  function toggleDark() {
    if (preference.value === 'auto') {
      preference.value = isDark.value ? 'light' : 'dark'
    } else {
      preference.value = 'auto'
    }
  }

  if (!isServer) {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark' || stored === 'light' || stored === 'auto') {
      preference.value = stored as ColorPreference
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const updateSystemPreference = () => {
      systemIsDark.value = mediaQuery.matches
    }

    mediaQuery.addEventListener('change', updateSystemPreference)

    updateSystemPreference()

    watchEffect(() => {
      const htmlEl = document.documentElement
      if (isDark.value) {
        htmlEl.classList.add('dark')
      } else {
        htmlEl.classList.remove('dark')
      }
    })

    // 4. 同步 LocalStorage (响应式)
    watch(preference, (newValue) => {
      localStorage.setItem(STORAGE_KEY, newValue)
    })
  }

  return { isDark, toggleDark, preference }
}
