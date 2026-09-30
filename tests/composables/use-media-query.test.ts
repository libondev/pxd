import { describe, expect, it, vi, beforeEach, afterEach } from 'vite-plus/test'
import { useMediaQuery } from '../../src/composables/use-media-query'
import { runWithScope } from '../helpers/setup'

describe('useMediaQuery', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return a ref', () => {
    const { result, stop } = runWithScope(() => useMediaQuery('(min-width: 768px)'))

    expect(result).toBeDefined()
    expect(typeof result.value).toBe('boolean')
    stop()
  })

  it('should return boolean based on matchMedia', () => {
    const { result, stop } = runWithScope(() => useMediaQuery('(min-width: 768px)'))

    expect(typeof result.value).toBe('boolean')
    stop()
  })

  it('should export PRESET_MEDIA_QUERIES', async () => {
    const { PRESET_MEDIA_QUERIES } = await import('../../src/composables/use-media-query')

    expect(PRESET_MEDIA_QUERIES).toBeDefined()
    expect(PRESET_MEDIA_QUERIES.IS_XS).toBeDefined()
    expect(PRESET_MEDIA_QUERIES.SM_UP).toBeDefined()
    expect(PRESET_MEDIA_QUERIES.MD_UP).toBeDefined()
  })

  it('should release every subscriber when a shared condition is disposed', () => {
    const condition = '(min-width: 1px)'
    const original = window.matchMedia
    let addCount = 0
    let removeCount = 0

    // Wrap matchMedia so the shared MediaQueryList is observable.
    window.matchMedia = ((query: string) => {
      const mql = original.call(window, query)
      const add = mql.addEventListener.bind(mql) as (
        type: string,
        listener: EventListenerOrEventListenerObject | null,
        options?: boolean | AddEventListenerOptions,
      ) => void
      const remove = mql.removeEventListener.bind(mql) as (
        type: string,
        listener: EventListenerOrEventListenerObject | null,
        options?: boolean | EventListenerOptions,
      ) => void

      mql.addEventListener = ((
        type: string,
        listener: EventListenerOrEventListenerObject | null,
        options?: boolean | AddEventListenerOptions,
      ) => {
        addCount++
        add.call(mql, type, listener, options)
      }) as MediaQueryList['addEventListener']

      mql.removeEventListener = ((
        type: string,
        listener: EventListenerOrEventListenerObject | null,
        options?: boolean | EventListenerOptions,
      ) => {
        removeCount++
        remove.call(mql, type, listener, options)
      }) as MediaQueryList['removeEventListener']

      return mql
    }) as typeof window.matchMedia

    const first = runWithScope(() => useMediaQuery(condition))
    const second = runWithScope(() => useMediaQuery(condition))

    // Read so both subscriptions actually attach.
    void first.result.value
    void second.result.value

    // One physical listener shared by both subscribers.
    expect(addCount).toBe(1)

    first.stop()
    expect(removeCount).toBe(0)

    second.stop()
    expect(removeCount).toBe(1)

    window.matchMedia = original
  })

  it('should evict the cache entry so a later subscriber builds a fresh query', () => {
    const condition = '(min-width: 2px)'
    const original = window.matchMedia
    let createCount = 0

    window.matchMedia = ((query: string) => {
      createCount++
      return original.call(window, query)
    }) as typeof window.matchMedia

    const first = runWithScope(() => useMediaQuery(condition))
    expect(typeof first.result.value).toBe('boolean')
    expect(createCount).toBe(1)
    first.stop()

    const second = runWithScope(() => useMediaQuery(condition))
    expect(typeof second.result.value).toBe('boolean')
    expect(createCount).toBe(2)

    second.stop()
    window.matchMedia = original
  })
})
