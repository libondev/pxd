import { describe, expect, it } from 'vite-plus/test'
import { useToggleValue } from '../../src/composables/use-toggle-value'

describe('useToggleValue', () => {
  it('should default to false', () => {
    const { value } = useToggleValue()
    expect(value.value).toBe(false)
  })

  it('should accept initial value', () => {
    const { value } = useToggleValue(true)
    expect(value.value).toBe(true)
  })

  it('should toggle value', () => {
    const { value, toggle } = useToggleValue()

    toggle()
    expect(value.value).toBe(true)

    toggle()
    expect(value.value).toBe(false)
  })

  it('should set specific value', () => {
    const { value, toggle } = useToggleValue()

    toggle(true)
    expect(value.value).toBe(true)

    toggle(false)
    expect(value.value).toBe(false)
  })

  it('should use custom truthy/falsy values', () => {
    const { value, toggle } = useToggleValue(false, {
      truthyValue: 'on',
      falsyValue: 'off',
    })

    expect(value.value).toBe(false)

    toggle()
    expect(value.value).toBe('on')

    toggle()
    expect(value.value).toBe('off')
  })
})
