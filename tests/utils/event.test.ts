import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { cachedOff, cachedOn } from '../../src/utils/event'

describe('event.ts memory leak prevention', () => {
  let container: HTMLDivElement
  // let originalDocumentHead: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    // originalDocumentHead = document.head
  })

  afterEach(() => {
    document.body.removeChild(container)
    vi.restoreAllMocks()
  })

  it('should not leak memory when cachedOn is called multiple times', () => {
    const handler1 = vi.fn()
    const handler2 = vi.fn()
    const handler3 = vi.fn()

    // Call cachedOn multiple times
    const cleanup1 = cachedOn(container, 'click', handler1)
    const cleanup2 = cachedOn(container, 'click', handler2)
    const cleanup3 = cachedOn(container, 'click', handler3)

    // Verify all handlers are registered
    container.click()
    expect(handler1).toHaveBeenCalledTimes(1)
    expect(handler2).toHaveBeenCalledTimes(1)
    expect(handler3).toHaveBeenCalledTimes(1)

    // Cleanup
    cleanup1()
    cleanup2()
    cleanup3()

    // Verify no handlers remain
    container.click()
    expect(handler1).toHaveBeenCalledTimes(1) // Should not be called again
    expect(handler2).toHaveBeenCalledTimes(1)
    expect(handler3).toHaveBeenCalledTimes(1)
  })

  it('should properly clean up when element is removed from DOM', () => {
    const handler = vi.fn()
    const testElement = document.createElement('div')
    document.body.appendChild(testElement)

    // Add event listener
    const cleanup = cachedOn(testElement, 'scroll', handler)

    // Remove element from DOM
    document.body.removeChild(testElement)

    // Cleanup should still work
    expect(() => cleanup()).not.toThrow()
  })

  it('should handle rapid add/remove cycles without leaking', () => {
    const handler = vi.fn()

    // Rapid cycles
    for (let i = 0; i < 100; i++) {
      const cleanup = cachedOn(container, 'click', handler)
      cleanup()
    }

    // Should not have accumulated any handlers
    container.click()
    expect(handler).toHaveBeenCalledTimes(0)
  })

  it('should deduplicate handlers correctly', () => {
    const handler = vi.fn()

    const cleanup1 = cachedOn(container, 'click', handler)
    const cleanup2 = cachedOn(container, 'click', handler) // Same handler
    const cleanup3 = cachedOn(container, 'click', handler) // Same handler again

    // Should only be called once per click
    container.click()
    expect(handler).toHaveBeenCalledTimes(1)

    // Cleanup all
    cleanup1()
    cleanup2()
    cleanup3()

    container.click()
    expect(handler).toHaveBeenCalledTimes(1) // Still 1, not called again
  })

  it('should return cleanup function that properly removes handler', () => {
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    const cleanup1 = cachedOn(container, 'click', handler1)
    const cleanup2 = cachedOn(container, 'click', handler2)

    // Both should work
    container.click()
    expect(handler1).toHaveBeenCalledTimes(1)
    expect(handler2).toHaveBeenCalledTimes(1)

    // Remove first handler
    cleanup1()

    container.click()
    expect(handler1).toHaveBeenCalledTimes(1) // Not called again
    expect(handler2).toHaveBeenCalledTimes(2) // Still works

    // Remove second handler
    cleanup2()

    container.click()
    expect(handler1).toHaveBeenCalledTimes(1)
    expect(handler2).toHaveBeenCalledTimes(2)
  })

  it('should not leak memory with multiple elements', () => {
    const elements = [0, 1, 2, 3, 4].map(() => document.createElement('div'))
    const handler = vi.fn()

    // Add to all elements
    const cleanups = elements.map((el) => {
      document.body.appendChild(el)
      return cachedOn(el, 'click', handler)
    })

    // Click all
    elements.forEach((el) => el.click())
    expect(handler).toHaveBeenCalledTimes(5)

    // Cleanup all
    cleanups.forEach((cleanup) => cleanup())
    elements.forEach((el) => document.body.removeChild(el))

    // Verify no leaks
    expect(() => {
      elements.forEach((el) => el.click())
    }).not.toThrow()
  })

  it('should handle cachedOff correctly', () => {
    const handler = vi.fn()

    cachedOn(container, 'click', handler)
    container.click()
    expect(handler).toHaveBeenCalledTimes(1)

    // Remove using cachedOff
    cachedOff(container, 'click', handler)

    container.click()
    expect(handler).toHaveBeenCalledTimes(1) // Should not be called again
  })

  it('should handle cachedOff with multiple handlers', () => {
    const handler1 = vi.fn()
    const handler2 = vi.fn()
    const handler3 = vi.fn()

    cachedOn(container, 'click', handler1)
    cachedOn(container, 'click', handler2)
    cachedOn(container, 'click', handler3)

    container.click()
    expect(handler1).toHaveBeenCalledTimes(1)
    expect(handler2).toHaveBeenCalledTimes(1)
    expect(handler3).toHaveBeenCalledTimes(1)

    // Remove middle handler
    cachedOff(container, 'click', handler2)

    container.click()
    expect(handler1).toHaveBeenCalledTimes(2)
    expect(handler2).toHaveBeenCalledTimes(1) // Not called again
    expect(handler3).toHaveBeenCalledTimes(2)

    // Remove all remaining
    cachedOff(container, 'click', handler1)
    cachedOff(container, 'click', handler3)

    container.click()
    expect(handler1).toHaveBeenCalledTimes(2)
    expect(handler2).toHaveBeenCalledTimes(1)
    expect(handler3).toHaveBeenCalledTimes(2)
  })
})
