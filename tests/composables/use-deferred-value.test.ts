import { describe, expect, it, vi } from 'vite-plus/test'
import { useDeferredValue } from '../../src/composables/use-deferred-value'
import { runWithScope } from '../helpers/setup'

describe('useDeferredValue', () => {
  it('should export useDeferredValue as a function', () => {
    expect(typeof useDeferredValue).toBe('function')
  })

  it('should return value and deferred refs', () => {
    const { result, stop } = runWithScope(() => useDeferredValue('hello'))

    expect(result.value).toBeDefined()
    expect(result.deferred).toBeDefined()
    expect(result.value.value).toBe('hello')
    expect(result.deferred.value).toBe('hello')
    stop()
  })

  it('should update value immediately', () => {
    const { result, stop } = runWithScope(() => useDeferredValue('hello'))
    const { value, deferred } = result

    value.value = 'world'
    expect(value.value).toBe('world')
    expect(deferred.value).toBe('hello')
    stop()
  })

  it('should accept custom delay option', () => {
    const { result, stop } = runWithScope(() => useDeferredValue('hello', { delay: 500 }))
    const { value, deferred } = result

    expect(value.value).toBe('hello')
    expect(deferred.value).toBe('hello')
    stop()
  })

  it('should accept valueChange callback option', () => {
    const valueChange = vi.fn()
    const { result, stop } = runWithScope(() =>
      useDeferredValue('hello', { delay: 100, valueChange }),
    )
    const { value } = result

    expect(value.value).toBe('hello')
    stop()
  })
})
