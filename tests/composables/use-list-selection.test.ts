import { describe, expect, it, vi } from 'vite-plus/test'
import { useListSelection } from '../../src/composables/_internal/use-list-selection'

describe('useListSelection', () => {
  it('should emit change immediately in single mode and ask to close', () => {
    const emits = vi.fn()
    const { select, selected } = useListSelection({ modelValue: null }, emits)

    expect(select(2)).toBe(true)
    expect(selected.value).toBe(2)
    expect(emits).toHaveBeenCalledWith('update:modelValue', 2)
    expect(emits).toHaveBeenCalledWith('change', 2)
  })

  it('should keep local multiple state without waiting for props', () => {
    const emits = vi.fn()
    const { select, selected, commit } = useListSelection(
      { multiple: true, modelValue: [] },
      emits,
    )

    expect(select(1)).toBe(false)
    expect(select(3)).toBe(false)
    expect(select(1)).toBe(false)
    expect(selected.value).toEqual([3])
    expect(emits).toHaveBeenCalledTimes(3)
    expect(emits).not.toHaveBeenCalledWith('change', expect.anything())

    commit()
    expect(emits).toHaveBeenCalledWith('change', [3])
  })

  it('should not emit change on commit when nothing changed', () => {
    const emits = vi.fn()
    const { commit } = useListSelection({ multiple: true, modelValue: [] }, emits)

    commit()
    expect(emits).not.toHaveBeenCalled()
  })
})
