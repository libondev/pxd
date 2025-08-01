import type { Ref } from 'vue'
import { onBeforeUnmount, shallowRef } from 'vue'
import { on } from '../utils/events'
import { isServer } from '../utils/is'

interface CacheObject {
  [key: string]: {
    count: number
    query: MediaQueryList
  }
}

const CACHED_QUERIES: CacheObject = {}

export const PRESET_MEDIA_QUERIES = {
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

export function useMediaQuery(
  condition: string,
  callback?: (e: MediaQueryList) => void,
): Ref<boolean> {
  const matches = shallowRef(false)

  if (isServer) {
    return matches
  }

  let mediaQuery = CACHED_QUERIES[condition]

  if (mediaQuery) {
    mediaQuery.count++
  } else {
    mediaQuery = CACHED_QUERIES[condition] = {
      count: 1,
      query: window.matchMedia(condition),
    }
  }

  matches.value = mediaQuery.query.matches

  callback?.(mediaQuery.query)

  const handler = (event: MediaQueryListEvent) => {
    callback?.(mediaQuery.query)
    matches.value = event.matches
  }

  const unbindEvent = on(mediaQuery.query, 'change', handler, { passive: true })

  onBeforeUnmount(() => {
    unbindEvent()
    mediaQuery.count--

    if (mediaQuery.count <= 0) {
      delete CACHED_QUERIES[condition]
    }

    mediaQuery = undefined!
  })

  return matches
}
