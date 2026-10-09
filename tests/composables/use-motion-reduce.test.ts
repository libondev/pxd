import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { nextTick, watch } from 'vue'
import { useMotionReduced } from '../../src/composables/_internal/use-motion-reduce'
import { installMutationObserverMock, runWithScope } from '../helpers/setup'

function stubComputedStyle(duration: string) {
  vi.stubGlobal(
    'getComputedStyle',
    vi.fn(() => ({
      getPropertyValue: () => duration,
    })),
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useMotionReduced', () => {
  it('should return a ref', () => {
    const { result, stop } = runWithScope(() => useMotionReduced())

    expect(result).toBeDefined()
    expect(typeof result.value).toBe('boolean')
    stop()
  })

  it('should treat a zero --duration as reduced motion', () => {
    stubComputedStyle('0')
    const { result, stop } = runWithScope(() => useMotionReduced())

    expect(result.value).toBe(true)
    stop()
  })

  it('should accept any authored zero token for --duration', () => {
    stubComputedStyle('0s')
    const { result, stop } = runWithScope(() => useMotionReduced())

    expect(result.value).toBe(true)
    stop()
  })

  it('should not treat a non-zero --duration as reduced motion', () => {
    stubComputedStyle('.15s')
    const { result, stop } = runWithScope(() => useMotionReduced())

    expect(result.value).toBe(false)
    stop()
  })

  it('should treat an unset --duration as not reduced', () => {
    stubComputedStyle('')
    const { result, stop } = runWithScope(() => useMotionReduced())

    expect(result.value).toBe(false)
    stop()
  })

  it('should refresh when root attributes mutate', async () => {
    const observer = installMutationObserverMock()
    stubComputedStyle('.15s')

    const { result, stop } = runWithScope(() => useMotionReduced())

    await nextTick()
    expect(result.value).toBe(false)

    stubComputedStyle('0')
    observer.fireAll()
    await nextTick()

    expect(result.value).toBe(true)
    stop()
  })

  it('should observe the root once for every caller', async () => {
    const observer = installMutationObserverMock()
    stubComputedStyle('.15s')

    const first = runWithScope(() => useMotionReduced())
    await nextTick()
    const second = runWithScope(() => useMotionReduced())
    await nextTick()

    expect(observer.count).toBe(1)
    expect(observer.observed()).toEqual([document.documentElement])

    first.stop()
    second.stop()
  })

  it('should stop observing once the last caller leaves', async () => {
    const observer = installMutationObserverMock()
    stubComputedStyle('.15s')

    const first = runWithScope(() => useMotionReduced())
    await nextTick()
    const second = runWithScope(() => useMotionReduced())
    await nextTick()

    expect(observer.observed()).toHaveLength(1)

    first.stop()
    await nextTick()

    expect(observer.observed()).toHaveLength(1)

    second.stop()
    await nextTick()

    expect(observer.observed()).toHaveLength(0)
  })

  it('should not notify subscribers for mutations that leave the value alone', async () => {
    const observer = installMutationObserverMock()
    stubComputedStyle('.15s')

    const notify = vi.fn()
    const { result, stop } = runWithScope(() => {
      const reduced = useMotionReduced()
      watch(reduced, notify)

      return reduced
    })

    await nextTick()
    expect(result.value).toBe(false)

    observer.fireAll()
    await nextTick()

    expect(notify).not.toHaveBeenCalled()

    stubComputedStyle('0')
    observer.fireAll()
    await nextTick()

    expect(notify).toHaveBeenCalledTimes(1)
    expect(result.value).toBe(true)

    stop()
  })
})
