import type { Ref } from 'vue'
import { onUnmounted, shallowRef } from 'vue'
import { on } from '../utils/events'

export function useMediaQuery(query: string): Ref<boolean> {
  const matches = shallowRef(false)

  if (typeof window === 'undefined' || !window.matchMedia) {
    return matches
  }

  const mediaQuery = window.matchMedia(query)
  matches.value = mediaQuery.matches

  const handler = (event: MediaQueryListEvent) => {
    matches.value = event.matches
  }

  const unbindEvent = on(mediaQuery, 'change', handler, { passive: true })

  onUnmounted(unbindEvent)

  return matches
}

export const MEDIA_QUERY = {
  MOTION_REDUCE: '(prefers-reduced-motion: reduce)',
  MOTION_NO_PREFERENCE: '(prefers-reduced-motion: no-preference)',
  MOTION_NO_REDUCE: '(prefers-reduced-motion: no-reduce)',

  COLOR_SCHEME_LIGHT: '(prefers-color-scheme: light)',
  COLOR_SCHEME_DARK: '(prefers-color-scheme: dark)',
  COLOR_SCHEME_NO_PREFERENCE: '(prefers-color-scheme: no-preference)',

  SCROLLBAR_WIDTH: '(scrollbar-width: thin)',
  SCROLLBAR_WIDTH_NONE: '(scrollbar-width: none)',
  SCROLLBAR_HEIGHT: '(scrollbar-height: thin)',
  SCROLLBAR_HEIGHT_NONE: '(scrollbar-height: none)',
}
