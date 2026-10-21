import type { Ref, ShallowRef } from 'vue'
import { onScopeDispose, shallowRef } from 'vue'
import { cachedOn } from '../utils/event.js'
import { isServer } from '../utils/is.js'

type QueryCallback = (e: MediaQueryList) => void

interface CacheEntry {
  count: number
  matches: ShallowRef<boolean>
  query: MediaQueryList
  callbacks: Set<QueryCallback>
  unbind: () => void
}

export const PRESET_MEDIA_QUERIES = {
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

const CACHED_QUERIES: Record<string, CacheEntry> = {}

function createEntry(condition: string): CacheEntry {
  const query = window.matchMedia(condition)
  const matches = shallowRef(query.matches)
  const callbacks = new Set<QueryCallback>()

  const unbind = cachedOn(
    query,
    'change',
    () => {
      matches.value = query.matches

      for (const callback of callbacks) {
        callback(query)
      }
    },
    { passive: true },
  )

  return { count: 0, matches, query, callbacks, unbind }
}

export function useMediaQuery(condition: string, callback?: QueryCallback): Ref<boolean> {
  if (isServer()) {
    return shallowRef(false)
  }

  const entry = (CACHED_QUERIES[condition] ??= createEntry(condition))
  const handler = callback ? () => callback(entry.query) : null

  entry.count++

  if (handler) {
    entry.callbacks.add(handler)
  }

  onScopeDispose(() => {
    if (handler) {
      entry.callbacks.delete(handler)
    }

    if (--entry.count > 0) {
      return
    }

    entry.unbind()

    delete CACHED_QUERIES[condition]
  })

  return entry.matches
}
