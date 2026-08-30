import { describe, expect, it } from 'vite-plus/test'
import { shallowRef } from 'vue'
import { useForwardRefExpose } from '../../src/composables/_internal/use-forward-ref-expose'

describe('useForwardRefExpose', () => {
  it('should proxy property access to target', () => {
    const target = { foo: 'bar', count: 42 }
    const proxy = useForwardRefExpose(target)

    expect(proxy.foo).toBe('bar')
    expect(proxy.count).toBe(42)
  })

  it('should return undefined when target is null', () => {
    const proxy = useForwardRefExpose(null as any)

    expect(proxy.anything).toBeUndefined()
  })

  it('should proxy set operations', () => {
    const target = { value: 1 } as any
    const proxy = useForwardRefExpose(target)

    proxy.value = 2
    expect(target.value).toBe(2)
  })

  it('should proxy function calls with correct binding', () => {
    const target = {
      name: 'test',
      greet() {
        return `Hello ${this.name}`
      },
    }
    const proxy = useForwardRefExpose(target)

    expect(proxy.greet()).toBe('Hello test')
  })

  it('should support has check', () => {
    const target = { exists: true }
    const proxy = useForwardRefExpose(target)

    expect('exists' in proxy).toBe(true)
    expect('missing' in proxy).toBe(false)
  })

  it('should work with reactive ref', () => {
    const refObj = shallowRef({ value: 10 })
    const proxy = useForwardRefExpose(refObj)

    expect(proxy.value).toBe(10)

    refObj.value = { value: 20 }
    expect(proxy.value).toBe(20)
  })

  it('should return empty array for ownKeys when target is null', () => {
    const proxy = useForwardRefExpose(null as any)

    expect(Object.keys(proxy)).toEqual([])
  })
})
