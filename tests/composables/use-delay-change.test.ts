import { describe, expect, it, vi, beforeEach, afterEach } from 'vite-plus/test'
import { useDelayChange } from '../../src/composables/use-delay-change'

describe('useDelayChange', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return initial value', () => {
    const { value } = useDelayChange('initial')

    expect(value.value).toBe('initial')
  })

  it('should update value after delay', () => {
    const { value, setValue } = useDelayChange('initial', { delay: 300 })

    setValue('changed')
    vi.advanceTimersByTime(300)
    expect(value.value).toBe('changed')
  })

  it('should update immediately when immediate flag is true', () => {
    const { value, setValue } = useDelayChange<string>('initial')

    setValue('changed', true)
    expect(value.value).toBe('changed')
  })

  it('should call valueChange callback on immediate set', () => {
    const valueChange = vi.fn()
    const { setValue } = useDelayChange<string>('initial', { valueChange })

    setValue('changed', true)
    expect(valueChange).toHaveBeenCalledWith('changed')
  })

  it('should call valueChange callback after delay', () => {
    const valueChange = vi.fn()
    const { setValue } = useDelayChange<string>('initial', { delay: 200, valueChange })

    setValue('changed')
    vi.advanceTimersByTime(200)
    expect(valueChange).toHaveBeenCalledWith('changed')
  })

  it('should cancel pending timer on new setValue', () => {
    const { value, setValue } = useDelayChange('initial', { delay: 300 })

    setValue('first')
    vi.advanceTimersByTime(100)
    setValue('second')
    vi.advanceTimersByTime(300)
    expect(value.value).toBe('second')
  })
})
