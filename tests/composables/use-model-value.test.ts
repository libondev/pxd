import { describe, expect, it, vi } from 'vite-plus/test'
import { useModelValue } from '../../src/composables/_internal/use-model-value'

describe('useModelValue', () => {
  it('should return a writable computed ref', () => {
    const props = { modelValue: 'initial' }
    const emits = vi.fn()
    const modelValue = useModelValue(props, emits)

    expect(modelValue.value).toBe('initial')
  })

  it('should emit update:modelValue on set', () => {
    const props = { modelValue: 'initial' }
    const emits = vi.fn()
    const modelValue = useModelValue(props, emits)

    modelValue.value = 'changed'

    expect(emits).toHaveBeenCalledWith('update:modelValue', 'changed')
  })

  it('should emit change by default', () => {
    const props = { modelValue: 'initial' }
    const emits = vi.fn()
    const modelValue = useModelValue(props, emits)

    modelValue.value = 'changed'

    expect(emits).toHaveBeenCalledWith('change', 'changed')
  })

  it('should not emit change when withChange is false', () => {
    const props = { modelValue: 'initial' }
    const emits = vi.fn()
    const modelValue = useModelValue(props, emits, { withChange: false })

    modelValue.value = 'changed'

    expect(emits).toHaveBeenCalledWith('update:modelValue', 'changed')
    expect(emits).not.toHaveBeenCalledWith('change', 'changed')
  })
})
