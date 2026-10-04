import { describe, expect, it, vi } from 'vite-plus/test'
import { nextTick, ref } from 'vue'
import { useResizeObserver } from '../../src/composables/use-resize-observer'
import { runWithScope } from '../helpers/setup'

const OPTIONS = { box: 'content-box' } as const

const OTHER_OPTIONS = { box: 'border-box' } as const

describe('use-resize-observer', () => {
  it('should export useResizeObserver', () => {
    expect(typeof useResizeObserver).toBe('function')
  })

  it('should return observer and stop function from useResizeObserver', () => {
    const { result, stop } = runWithScope(() => useResizeObserver(null, () => {}))

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

  it('should not reconnect when the resolved targets are unchanged', async () => {
    const a = document.createElement('div')
    const b = document.createElement('div')
    document.body.append(a, b)

    const observe = vi.spyOn(ResizeObserver.prototype, 'observe')
    const disconnect = vi.spyOn(ResizeObserver.prototype, 'disconnect')
    const list = ref<HTMLElement[]>([a, b])

    const { stop } = runWithScope(() => useResizeObserver(list, () => {}, OPTIONS))
    await nextTick()

    expect(observe).toHaveBeenCalledTimes(2)
    expect(disconnect).toHaveBeenCalledTimes(0)

    // New array identity, same members: the observer must be left alone.
    list.value = [a, b]
    await nextTick()

    expect(observe).toHaveBeenCalledTimes(2)
    expect(disconnect).toHaveBeenCalledTimes(0)

    observe.mockRestore()
    disconnect.mockRestore()
    stop()
    a.remove()
    b.remove()
  })

  it('should unobserve removed targets without rebuilding', async () => {
    const a = document.createElement('div')
    const b = document.createElement('div')
    document.body.append(a, b)

    const observe = vi.spyOn(ResizeObserver.prototype, 'observe')
    const unobserve = vi.spyOn(ResizeObserver.prototype, 'unobserve')
    const disconnect = vi.spyOn(ResizeObserver.prototype, 'disconnect')
    const list = ref<HTMLElement[]>([a, b])

    const { stop } = runWithScope(() => useResizeObserver(list, () => {}, OPTIONS))
    await nextTick()

    list.value = [a]
    await nextTick()

    expect(unobserve).toHaveBeenCalledWith(b)
    expect(observe).toHaveBeenCalledTimes(2)
    expect(disconnect).toHaveBeenCalledTimes(0)

    observe.mockRestore()
    unobserve.mockRestore()
    disconnect.mockRestore()
    stop()
    a.remove()
    b.remove()
  })

  it('should share one native observer across calls with equal options', async () => {
    const a = document.createElement('div')
    const b = document.createElement('div')
    document.body.append(a, b)

    const ctorSpy = vi.spyOn(globalThis, 'ResizeObserver')

    const first = runWithScope(() => useResizeObserver(a, () => {}, OPTIONS))
    const second = runWithScope(() => useResizeObserver(b, () => {}, OPTIONS))
    await nextTick()

    expect(ctorSpy).toHaveBeenCalledTimes(1)

    ctorSpy.mockRestore()
    first.stop()
    second.stop()
    a.remove()
    b.remove()
  })

  it('should not share an observer across differing options', async () => {
    const a = document.createElement('div')
    document.body.appendChild(a)

    const ctorSpy = vi.spyOn(globalThis, 'ResizeObserver')

    const first = runWithScope(() => useResizeObserver(a, () => {}, OPTIONS))
    const second = runWithScope(() => useResizeObserver(a, () => {}, OTHER_OPTIONS))
    await nextTick()

    expect(ctorSpy).toHaveBeenCalledTimes(2)

    ctorSpy.mockRestore()
    first.stop()
    second.stop()
    a.remove()
  })

  it('should observe a shared target once for two subscribers', async () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    const observe = vi.spyOn(ResizeObserver.prototype, 'observe')

    const first = runWithScope(() => useResizeObserver(el, () => {}, OPTIONS))
    const second = runWithScope(() => useResizeObserver(el, () => {}, OPTIONS))
    await nextTick()

    expect(observe).toHaveBeenCalledTimes(1)

    observe.mockRestore()
    first.stop()
    second.stop()
    el.remove()
  })

  it('should drop the shared observer once the last subscriber stops', async () => {
    const a = document.createElement('div')
    const b = document.createElement('div')
    document.body.append(a, b)

    const ctorSpy = vi.spyOn(globalThis, 'ResizeObserver')
    const disconnect = vi.spyOn(ResizeObserver.prototype, 'disconnect')

    const first = runWithScope(() => useResizeObserver(a, () => {}, OPTIONS))
    const second = runWithScope(() => useResizeObserver(b, () => {}, OPTIONS))
    await nextTick()

    first.stop()
    expect(disconnect).toHaveBeenCalledTimes(0)

    second.stop()
    expect(disconnect).toHaveBeenCalledTimes(1)

    // A later call must build a fresh observer rather than reuse the dropped one.
    const third = runWithScope(() => useResizeObserver(a, () => {}, OPTIONS))
    await nextTick()
    expect(ctorSpy).toHaveBeenCalledTimes(2)

    ctorSpy.mockRestore()
    disconnect.mockRestore()
    third.stop()
    a.remove()
    b.remove()
  })
})
