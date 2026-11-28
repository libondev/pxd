import type { ChangeAt } from '../../src/types/shared/change'
import { describe, expect, it, vi } from 'vite-plus/test'
import { withChangeDetails } from '../../src/composables/_internal/use-change-details'
import { useModelValue } from '../../src/composables/_internal/use-model-value'

const setup = (modelValue: string | undefined, options: { defaultValue?: () => string } = {}) => {
  const props = { modelValue }
  const emits = vi.fn()

  return { emits, ...useModelValue(props, emits, options) }
}

const detailsOf = (emits: ReturnType<typeof vi.fn>) =>
  emits.mock.calls.find(([event]) => event === 'change')?.[2]

describe('useModelValue', () => {
  it('should give a writable computed ref', () => {
    const { modelValue } = setup('initial')

    expect(modelValue.value).toBe('initial')
  })

  it('should emit update:model-value on set', () => {
    const { modelValue, emits } = setup('initial')

    modelValue.value = 'changed'

    expect(emits).toHaveBeenCalledWith('update:model-value', 'changed')
  })

  it('should emit change by default', () => {
    const { modelValue, emits } = setup('initial')

    modelValue.value = 'changed'

    expect(emits).toHaveBeenCalledWith(
      'change',
      'changed',
      expect.objectContaining({ canceled: false }),
    )
  })

  it('should fall back to the default value when uncontrolled', () => {
    const { modelValue, emits } = setup(undefined, { defaultValue: () => 'initial' })

    expect(modelValue.value).toBe('initial')

    modelValue.value = 'changed'

    expect(modelValue.value).toBe('changed')
    expect(emits).toHaveBeenCalledWith('update:model-value', 'changed')
  })

  it('should read the bound modelValue over the default value', () => {
    const { modelValue, emits } = setup('bound', { defaultValue: () => 'initial' })

    expect(modelValue.value).toBe('bound')

    modelValue.value = 'changed'

    expect(emits).toHaveBeenCalledWith('update:model-value', 'changed')
    expect(modelValue.value).toBe('bound')
  })

  it('should report the cause being dispatched', () => {
    const { modelValue, emits } = setup(undefined)

    withChangeDetails({ source: 'agent', reason: 'api' }, () => {
      modelValue.value = 'changed'
    })

    expect(detailsOf(emits)).toMatchObject({ source: 'agent', reason: 'api' })
    expect(modelValue.value).toBe('changed')
  })

  it('should claim nothing for a bare write', () => {
    const { modelValue, emits } = setup(undefined)

    modelValue.value = 'changed'

    expect(detailsOf(emits)).toMatchObject({ source: undefined })
  })

  it('should keep the previous value and skip update:model-value when the change is canceled', () => {
    const emits = vi.fn((...args: any[]) => {
      if (args[0] === 'change') {
        args[2].cancel()
      }
    })
    const { modelValue } = useModelValue({ modelValue: undefined as string | undefined }, emits, {
      defaultValue: () => 'initial',
    })

    modelValue.value = 'changed'

    expect(modelValue.value).toBe('initial')
    expect(emits).not.toHaveBeenCalledWith('update:model-value', 'changed')
  })

  it('should cancel a controlled write before update:model-value is emitted', () => {
    const emits = vi.fn((...args: any[]) => {
      if (args[0] === 'change') {
        args[2].cancel()
      }
    })
    const { modelValue } = useModelValue({ modelValue: 'bound' as string | undefined }, emits)

    modelValue.value = 'changed'

    expect(emits.mock.calls.filter(([event]) => event === 'update:model-value')).toHaveLength(0)
  })
})

describe('useModelValue change', () => {
  const write = (at: ChangeAt) => {
    const { change, emits } = setup(undefined)

    const written = change('changed', at)

    return { written, details: detailsOf(emits), emits }
  }

  it('should name a person when the write carries the event that caused it', () => {
    const { written, details } = write({ reason: 'item-press', event: new Event('click') })

    expect(written).toBe(true)
    expect(details).toMatchObject({ source: 'user', reason: 'item-press' })
  })

  it('should name a person for a reason only an interaction produces', () => {
    expect(write({ reason: 'cleared' }).details).toMatchObject({
      source: 'user',
      reason: 'cleared',
    })
  })

  it('should name a programmatic write only when the call says so', () => {
    expect(write({ reason: 'api' }).details).toMatchObject({
      source: 'programmatic',
      reason: 'api',
    })
  })

  it('should let an agent step outrank what the call site claims', () => {
    const props = { modelValue: undefined as string | undefined }
    const emits = vi.fn()
    const { change } = useModelValue(props, emits)

    withChangeDetails({ source: 'agent' }, () => change('changed', { reason: 'api' }))

    expect(detailsOf(emits)).toMatchObject({ source: 'agent', reason: 'api' })
  })

  it('should report a refused write and leave the value alone', () => {
    const emits = vi.fn((...args: any[]) => {
      if (args[0] === 'change') {
        args[2].cancel()
      }
    })
    const { modelValue, change } = useModelValue(
      { modelValue: undefined as string | undefined },
      emits,
      { defaultValue: () => 'initial' },
    )

    expect(change('changed', { reason: 'item-press' })).toBe(false)
    expect(modelValue.value).toBe('initial')
  })
})
