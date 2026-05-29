import { describe, expect, it, vi } from 'vite-plus/test'
import { useDeferredValue } from '../../src/composables/use-deferred-value'

describe('useDeferredValue', () => {
  it('should export useDeferredValue as a function', () => {
    expect(typeof useDeferredValue).toBe('function')
  })

  it('should return value and deferred refs', () => {
    const result = useDeferredValue('hello')

    expect(result.value).toBeDefined()
    expect(result.deferred).toBeDefined()
    expect(result.value.value).toBe('hello')
    expect(result.deferred.value).toBe('hello')
  })

  it('should update value immediately', () => {
    const { value, deferred } = useDeferredValue('hello')

    value.value = 'world'
    expect(value.value).toBe('world')
    expect(deferred.value).toBe('hello')
  })

  it('should accept custom delay option', () => {
    const { value, deferred } = useDeferredValue('hello', { delay: 500 })

    expect(value.value).toBe('hello')
    expect(deferred.value).toBe('hello')
  })

  it('should accept valueChange callback option', () => {
    const valueChange = vi.fn()
    const { value } = useDeferredValue('hello', { delay: 100, valueChange })

    expect(value.value).toBe('hello')
  })
})
