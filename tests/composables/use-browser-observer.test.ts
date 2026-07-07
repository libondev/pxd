import { describe, expect, it } from 'vite-plus/test'
import {
  useIntersectionObserver,
  useMutationObserver,
  useResizeObserver,
} from '../../src/composables/use-browser-observer'
import { runWithScope } from '../helpers/setup'

describe('use-browser-observer', () => {
  it('should export useIntersectionObserver', () => {
    expect(typeof useIntersectionObserver).toBe('function')
  })

  it('should export useMutationObserver', () => {
    expect(typeof useMutationObserver).toBe('function')
  })

  it('should export useResizeObserver', () => {
    expect(typeof useResizeObserver).toBe('function')
  })

  it('should return observer and stop function from useResizeObserver', () => {
    const { result, stop } = runWithScope(() => useResizeObserver(null, () => {}))

    expect(result).toHaveProperty('stop')
    expect(typeof result.stop).toBe('function')
    stop()
  })

  it('should return observer and stop function from useIntersectionObserver', () => {
    const { result, stop } = runWithScope(() => useIntersectionObserver(null, () => {}))

    expect(result).toHaveProperty('stop')
    expect(typeof result.stop).toBe('function')
    stop()
  })
})
