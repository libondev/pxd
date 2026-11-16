import { describe, expect, it, vi } from 'vite-plus/test'
import { withChangeDetails } from '../../src/composables/_internal/use-change-details'
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

    expect(emits).toHaveBeenCalledWith(
      'change',
      'changed',
      expect.objectContaining({ canceled: false }),
    )
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

  it('should report the source and reason of the change being dispatched', () => {
    const props = { modelValue: undefined as string | undefined }
    const emits = vi.fn()
    const modelValue = useModelValue(props, emits)

    withChangeDetails({ source: 'agent', reason: 'set-value' }, () => {
      modelValue.value = 'changed'
    })

    expect(emits).toHaveBeenCalledWith(
      'change',
      'changed',
      expect.objectContaining({ source: 'agent', reason: 'set-value' }),
    )
    expect(modelValue.value).toBe('changed')
  })

  it('should leave the source out when no cause is being dispatched', () => {
    const props = { modelValue: undefined as string | undefined }
    const emits = vi.fn()
    const modelValue = useModelValue(props, emits)

    modelValue.value = 'changed'

    expect(emits).toHaveBeenCalledWith(
      'change',
      'changed',
      expect.objectContaining({ source: undefined }),
    )
  })

  it('should keep the previous value and skip update:model-value when the change is canceled', () => {
    const props = { modelValue: undefined as string | undefined }
    const emits = vi.fn((...args: any[]) => {
      if (args[0] === 'change') {
        args[2].cancel()
      }
    })
    const modelValue = useModelValue(props, emits, { defaultValue: () => 'initial' })

    modelValue.value = 'changed'

    expect(modelValue.value).toBe('initial')
    expect(emits).not.toHaveBeenCalledWith('update:model-value', 'changed')
  })

  it('should cancel a controlled write before update:model-value is emitted', () => {
    const props = { modelValue: 'bound' as string | undefined }
    const emits = vi.fn((...args: any[]) => {
      if (args[0] === 'change') {
        args[2].cancel()
      }
    })
    const modelValue = useModelValue(props, emits)

    modelValue.value = 'changed'

    expect(emits.mock.calls.filter(([event]) => event === 'update:model-value')).toHaveLength(0)
  })
})
