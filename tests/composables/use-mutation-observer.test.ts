import { describe, expect, it, vi } from 'vite-plus/test'
import { nextTick, ref } from 'vue'
import { useMutationObserver } from '../../src/composables/use-mutation-observer'
import { runWithScope } from '../helpers/setup'

const OPTIONS = { childList: true }

describe('use-mutation-observer', () => {
  it('should export useMutationObserver', () => {
    expect(typeof useMutationObserver).toBe('function')
  })

  it('should return observer and stop function from useMutationObserver', () => {
    const { result, stop } = runWithScope(() => useMutationObserver(null, () => {}, OPTIONS))

    expect(result).toHaveProperty('stop')
    expect(typeof result.stop).toBe('function')
    stop()
  })

  it('should observe a duplicated target only once', async () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    const observe = vi.spyOn(MutationObserver.prototype, 'observe')
    const { stop } = runWithScope(() =>
      // The same element passed for two slots (content + container).
      useMutationObserver(
        () => [el, el],
        () => {},
        OPTIONS,
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

    const observe = vi.spyOn(MutationObserver.prototype, 'observe')
    const { stop } = runWithScope(() =>
      useMutationObserver(
        () => [a, b],
        () => {},
        OPTIONS,
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

    const observe = vi.spyOn(MutationObserver.prototype, 'observe')
    const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect')
    const list = ref<HTMLElement[]>([a, b])

    const { stop } = runWithScope(() => useMutationObserver(list, () => {}, OPTIONS))
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

  it('should replay the observed set when targets shrink', async () => {
    const a = document.createElement('div')
    const b = document.createElement('div')
    document.body.append(a, b)

    const observe = vi.spyOn(MutationObserver.prototype, 'observe')
    const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect')
    const list = ref<HTMLElement[]>([a, b])

    const { stop } = runWithScope(() => useMutationObserver(list, () => {}, OPTIONS))
    await nextTick()

    expect(observe).toHaveBeenCalledTimes(2)
    expect(disconnect).toHaveBeenCalledTimes(0)

    list.value = [a]
    await nextTick()

    // `b` is gone, `a` is the only member left.
    expect(disconnect).toHaveBeenCalledTimes(1)
    expect(observe).toHaveBeenCalledTimes(3)
    expect(observe.mock.calls.at(-1)?.[0]).toBe(a)

    observe.mockRestore()
    disconnect.mockRestore()
    stop()
    a.remove()
    b.remove()
  })

  it('should attribute subtree records to the registered element', async () => {
    const parent = document.createElement('div')
    const child = document.createElement('span')
    parent.appendChild(child)
    document.body.appendChild(parent)

    const seen: Array<{ target: HTMLElement }> = []
    const { stop } = runWithScope(() =>
      useMutationObserver(parent, (items) => seen.push(...items), {
        childList: true,
        subtree: true,
      }),
    )
    await nextTick()

    child.appendChild(document.createElement('i'))
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(seen.length).toBeGreaterThan(0)
    // The record's own target is the descendant, not the element we registered.
    expect(seen.every((item) => item.target === parent)).toBe(true)

    stop()
    parent.remove()
  })
})
