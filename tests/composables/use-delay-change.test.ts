import { describe, expect, it, vi, beforeEach, afterEach } from 'vite-plus/test'
import { ref } from 'vue'
import { useDelayChange } from '../../src/composables/use-delay-change'
import { runWithScope } from '../helpers/setup'

describe('useDelayChange', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return initial value', () => {
    const { result, stop } = runWithScope(() => useDelayChange('initial'))
    const { value } = result

    expect(value.value).toBe('initial')
    stop()
  })

  it('should update value after delay', () => {
    const { result, stop } = runWithScope(() => useDelayChange('initial', { delay: 300 }))
    const { value, setValue } = result

    setValue('changed')
    vi.advanceTimersByTime(300)
    expect(value.value).toBe('changed')
    stop()
  })

  it('should update immediately when immediate flag is true', () => {
    const { result, stop } = runWithScope(() => useDelayChange<string>('initial'))
    const { value, setValue } = result

    setValue('changed', true)
    expect(value.value).toBe('changed')
    stop()
  })

  it('should call valueChange callback on immediate set', () => {
    const valueChange = vi.fn()
    const { result, stop } = runWithScope(() => useDelayChange<string>('initial', { valueChange }))
    const { setValue } = result

    setValue('changed', true)
    expect(valueChange).toHaveBeenCalledWith('changed')
    stop()
  })

  it('should call valueChange callback after delay', () => {
    const valueChange = vi.fn()
    const { result, stop } = runWithScope(() =>
      useDelayChange<string>('initial', { delay: 200, valueChange }),
    )
    const { setValue } = result

    setValue('changed')
    vi.advanceTimersByTime(200)
    expect(valueChange).toHaveBeenCalledWith('changed')
    stop()
  })

  it('should cancel pending timer on new setValue', () => {
    const { result, stop } = runWithScope(() => useDelayChange('initial', { delay: 300 }))
    const { value, setValue } = result

    setValue('first')
    vi.advanceTimersByTime(100)
    setValue('second')
    vi.advanceTimersByTime(300)
    expect(value.value).toBe('second')
    stop()
  })

  it('should unwrap a ref initial value', () => {
    const source = ref('from-ref')
    const { result, stop } = runWithScope(() => useDelayChange(source))
    const { value } = result

    expect(value.value).toBe('from-ref')
    stop()
  })

  it('should unwrap a getter initial value', () => {
    const { result, stop } = runWithScope(() => useDelayChange(() => 'from-getter'))
    const { value } = result

    expect(value.value).toBe('from-getter')
    stop()
  })
})
