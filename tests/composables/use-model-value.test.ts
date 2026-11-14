import { describe, expect, it, vi } from 'vite-plus/test'
import { useModelValue } from '../../src/composables/_internal/use-model-value'

describe('useModelValue', () => {
  it('should return a writable computed ref', () => {
    const props = { modelValue: 'initial' }
    const emits = vi.fn()
    const modelValue = useModelValue(props, emits)

    expect(modelValue.value).toBe('initial')
  })

  it('should emit update:model-value on set', () => {
    const props = { modelValue: 'initial' }
    const emits = vi.fn()
    const modelValue = useModelValue(props, emits)

    modelValue.value = 'changed'

    expect(emits).toHaveBeenCalledWith('update:model-value', 'changed')
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

    expect(emits).toHaveBeenCalledWith('update:model-value', 'changed')
    expect(emits).not.toHaveBeenCalledWith('change', 'changed')
  })

  it('should fall back to the default value when uncontrolled', () => {
    const props = { modelValue: undefined as string | undefined }
    const emits = vi.fn()
    const modelValue = useModelValue(props, emits, { defaultValue: () => 'initial' })

    expect(modelValue.value).toBe('initial')

    modelValue.value = 'changed'

    expect(modelValue.value).toBe('changed')
    expect(emits).toHaveBeenCalledWith('update:model-value', 'changed')
  })

  it('should read the bound modelValue over the default value', () => {
    const props = { modelValue: 'bound' as string | undefined }
    const emits = vi.fn()
    const modelValue = useModelValue(props, emits, { defaultValue: () => 'initial' })

    expect(modelValue.value).toBe('bound')

    modelValue.value = 'changed'

    expect(emits).toHaveBeenCalledWith('update:model-value', 'changed')
    expect(modelValue.value).toBe('bound')
  })
})
