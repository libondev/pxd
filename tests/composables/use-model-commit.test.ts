import { describe, expect, it, vi } from 'vite-plus/test'
import { withChangeDetails } from '../../src/composables/_internal/use-change-details'
import { useModelCommit } from '../../src/composables/_internal/use-model-commit'

describe('useModelCommit', () => {
  it('should write the value without announcing a change', () => {
    const props = { modelValue: undefined as string | undefined }
    const emits = vi.fn()
    const { modelValue } = useModelCommit(props, emits, { defaultValue: () => 'initial' })

    modelValue.value = 'typed'

    expect(modelValue.value).toBe('typed')
    expect(emits).toHaveBeenCalledWith('update:model-value', 'typed')
    expect(emits).not.toHaveBeenCalledWith('change', expect.anything())
  })

  it('should keep the bound modelValue over the default value', () => {
    const props = { modelValue: 'bound' as string | undefined }
    const emits = vi.fn()
    const { modelValue } = useModelCommit(props, emits, { defaultValue: () => 'initial' })

    expect(modelValue.value).toBe('bound')

    modelValue.value = 'typed'

    expect(modelValue.value).toBe('bound')
    expect(emits).toHaveBeenCalledWith('update:model-value', 'typed')
  })

  it('should announce a change only when committed', () => {
    const props = { modelValue: undefined as string | undefined }
    const emits = vi.fn()
    const { modelValue, commit } = useModelCommit(props, emits, {
      defaultValue: () => 'initial',
    })

    modelValue.value = 'typed'
    commit(modelValue.value)

    expect(emits).toHaveBeenCalledWith(
      'change',
      'typed',
      expect.objectContaining({ canceled: false }),
    )
  })

  it('should append the details after the arguments the component passes', () => {
    const props = { modelValue: undefined as string | undefined }
    const emits = vi.fn()
    const { commit } = useModelCommit(props, emits)
    const event = new Event('change')

    commit('typed', event)

    expect(emits).toHaveBeenCalledWith(
      'change',
      'typed',
      event,
      expect.objectContaining({ canceled: false }),
    )
  })

  it('should report the source of the change being committed', () => {
    const props = { modelValue: undefined as string | undefined }
    const emits = vi.fn()
    const { commit } = useModelCommit(props, emits)

    withChangeDetails({ source: 'agent', reason: 'set-value' }, () => {
      commit('typed')
    })

    expect(emits).toHaveBeenCalledWith(
      'change',
      'typed',
      expect.objectContaining({ source: 'agent', reason: 'set-value', canceled: false }),
    )
  })

  it('should leave the source out once the cause is done', () => {
    const props = { modelValue: undefined as string | undefined }
    const emits = vi.fn()
    const { commit } = useModelCommit(props, emits)

    withChangeDetails({ source: 'agent' }, () => {})
    commit('typed')

    expect(emits).toHaveBeenCalledWith(
      'change',
      'typed',
      expect.objectContaining({ source: undefined }),
    )
  })
})
