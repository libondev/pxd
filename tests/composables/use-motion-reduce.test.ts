import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { useMotionReduced } from '../../src/composables/use-motion-reduce'
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
})
