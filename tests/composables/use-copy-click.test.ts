import { describe, expect, it, vi, beforeEach, afterEach } from 'vite-plus/test'
import { useCopyClick } from '../../src/composables/use-copy-click'
import { runWithScope } from '../helpers/setup'

describe('useCopyClick', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return isCopied and copyText', () => {
    const { result, stop } = runWithScope(() => useCopyClick())

    expect(result.isCopied).toBeDefined()
    expect(typeof result.copyText).toBe('function')
    expect(result.isCopied.value).toBe(false)
    stop()
  })

  it('should set isCopied to true after copy', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    })

    const { result, stop } = runWithScope(() => useCopyClick())
    const { isCopied, copyText } = result

    await copyText('test')
    expect(isCopied.value).toBe(true)
    stop()
  })

  it('should reset isCopied after timeout', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    })

    const { result, stop } = runWithScope(() => useCopyClick())
    const { isCopied, copyText } = result

    await copyText('test')
    expect(isCopied.value).toBe(true)

    vi.advanceTimersByTime(1500)
    expect(isCopied.value).toBe(false)
    stop()
  })

  it('should keep isCopied true while clicking repeatedly', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    })

    const { result, stop } = runWithScope(() => useCopyClick())
    const { isCopied, copyText } = result

    await copyText('test')
    expect(isCopied.value).toBe(true)

    vi.advanceTimersByTime(1000)
    await copyText('test')
    expect(isCopied.value).toBe(true)

    vi.advanceTimersByTime(1000)
    expect(isCopied.value).toBe(true)

    vi.advanceTimersByTime(1500)
    expect(isCopied.value).toBe(false)
    stop()
  })
})
