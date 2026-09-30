import { describe, expect, it, vi } from 'vite-plus/test'
import { nextTick } from 'vue'
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

  it('should observe a duplicated target only once', async () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    const observe = vi.spyOn(ResizeObserver.prototype, 'observe')
    const { stop } = runWithScope(() =>
      // The same element passed for two slots (content + container).
      useResizeObserver(
        () => [el, el],
        () => {},
      ),
    )

    await nextTick()

    expect(observe).toHaveBeenCalledTimes(1)

    observe.mockRestore()
    stop()
    el.remove()
  })

  it('should still observe two distinct targets', async () => {
    const a = document.createElement('div')
    const b = document.createElement('div')
    document.body.append(a, b)

    const observe = vi.spyOn(ResizeObserver.prototype, 'observe')
    const { stop } = runWithScope(() =>
      useResizeObserver(
        () => [a, b],
        () => {},
      ),
    )

    await nextTick()

    expect(observe).toHaveBeenCalledTimes(2)

    observe.mockRestore()
    stop()
    a.remove()
    b.remove()
  })
})
