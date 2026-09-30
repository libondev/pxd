import type { Ref } from 'vue'
import { customRef, onScopeDispose } from 'vue'
import { cachedOn } from '../utils/event.js'
import { isServer } from '../utils/is.js'

interface CacheObject {
  [key: string]: {
    count: number
    query: MediaQueryList
    cleanups: Array<() => void>
  }
}

export const PRESET_MEDIA_QUERIES = {
  MOTION_NO_PREFERENCE: '(prefers-reduced-motion: no-preference)',
  MOTION_NO_REDUCE: '(prefers-reduced-motion: no-reduce)',
  MOTION_REDUCE: '(prefers-reduced-motion: reduce)',

  COLOR_SCHEME_DARK: '(prefers-color-scheme: dark)',
  COLOR_SCHEME_LIGHT: '(prefers-color-scheme: light)',
  COLOR_SCHEME_NO_PREFERENCE: '(prefers-color-scheme: no-preference)',

  // SCROLLBAR_WIDTH_THIN: '(scrollbar-width: thin)',
  // SCROLLBAR_WIDTH_NONE: '(scrollbar-width: none)',
  // SCROLLBAR_HEIGHT_THIN: '(scrollbar-height: thin)',
  // SCROLLBAR_HEIGHT_NONE: '(scrollbar-height: none)',

  IS_XS: '(width < 40rem)',
  SM_UP: '(width >= 40rem)',
  MD_UP: '(width >= 48rem)',
  LG_UP: '(width >= 64rem)',
  XL_UP: '(width >= 80rem)',
  XXL_UP: '(width >= 96rem)',
}

const CACHED_QUERIES: CacheObject = {}

export function useMediaQuery(
  condition: string,
  callback?: (e: MediaQueryList) => void,
): Ref<boolean> {
  let initialized = false
  let mediaQuery: CacheObject[string] | undefined
  let unbindChange: (() => void) | undefined

  const matches = customRef<boolean>((track, trigger) => ({
    get() {
      track()

      if (isServer()) {
        return false
      }

      if (!initialized) {
        let cached = CACHED_QUERIES[condition]

        if (cached) {
          cached.count++
        } else {
          cached = CACHED_QUERIES[condition] = {
            count: 1,
            query: window.matchMedia(condition),
            cleanups: [],
          }
        }

        // Close over the immutable `entry` snapshot, never over the mutable
        // `mediaQuery` slot: that slot is cleared on dispose, so reading it here
        // would throw for any consumer disposed before the last one.
        const entry = cached
        const handler = () => {
          callback?.(entry.query)
          trigger()
        }

        unbindChange = cachedOn(entry.query, 'change', handler, { passive: true })

        entry.cleanups.push(unbindChange)

        mediaQuery = entry
        initialized = true
      }

      return mediaQuery?.query.matches ?? false
    },
    set() {
      trigger()
    },
  }))

  function stop() {
    if (!mediaQuery) {
      return
    }

    const entry = mediaQuery

    unbindChange?.()
    unbindChange = undefined

    entry.count--

    if (entry.count <= 0) {
      entry.cleanups.forEach((unbind) => unbind())
      entry.cleanups = []
      delete CACHED_QUERIES[condition]
    }

    mediaQuery = undefined
  }

  onScopeDispose(() => {
    stop()
  })

  return matches
}
