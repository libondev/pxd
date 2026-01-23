import type { Ref } from 'vue'
import { customRef, onBeforeUnmount } from 'vue'
import { cachedOn } from '../utils/event'
import { isServer } from '../utils/is'

interface CacheObject {
  [key: string]: {
    count: number
    query: MediaQueryList
    cleanup?: () => void
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

  const matches = customRef<boolean>((track, trigger) => ({
    get() {
      track()

      if (isServer()) {
        return false
      }

      if (!initialized) {
        mediaQuery = CACHED_QUERIES[condition]

        if (mediaQuery) {
          mediaQuery.count++
        } else {
          const query = window.matchMedia(condition)
          mediaQuery = CACHED_QUERIES[condition] = {
            count: 1,
            query,
          }
        }

        const handler = () => {
          callback?.(mediaQuery!.query)
          trigger()
        }

        const unbindEvent = cachedOn(mediaQuery.query, 'change', handler, { passive: true })

        if (!mediaQuery.cleanup) {
          mediaQuery.cleanup = unbindEvent
        }

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

    if (mediaQuery.cleanup) {
      mediaQuery.cleanup()
    }

    mediaQuery.count--

    if (mediaQuery.count <= 0) {
      delete CACHED_QUERIES[condition]
    }

    mediaQuery = undefined!
  }

  onBeforeUnmount(() => {
    stop()
  })

  return matches
}
