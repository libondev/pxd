import { describe, expect, it, vi, beforeEach, afterEach } from 'vite-plus/test'
import { useCopyClick } from '../../src/composables/use-copy-click'

describe('useCopyClick', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return isCopied and copyText', () => {
    const result = useCopyClick()

    expect(result.isCopied).toBeDefined()
    expect(typeof result.copyText).toBe('function')
    expect(result.isCopied.value).toBe(false)
  })

  it('should set isCopied to true after copy', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    })

    const { isCopied, copyText } = useCopyClick()

    await copyText('test')
    expect(isCopied.value).toBe(true)
  })

  it('should reset isCopied after timeout', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    })

    const { isCopied, copyText } = useCopyClick()

    await copyText('test')
    expect(isCopied.value).toBe(true)

    vi.advanceTimersByTime(1500)
    expect(isCopied.value).toBe(false)
  })

  it('should keep isCopied true while clicking repeatedly', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    })

    const { isCopied, copyText } = useCopyClick()

    await copyText('test')
    expect(isCopied.value).toBe(true)

    vi.advanceTimersByTime(1000)
    await copyText('test')
    expect(isCopied.value).toBe(true)

    vi.advanceTimersByTime(1000)
    expect(isCopied.value).toBe(true)

    vi.advanceTimersByTime(1500)
    expect(isCopied.value).toBe(false)
  })
})
