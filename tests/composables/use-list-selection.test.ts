import { describe, expect, it, vi } from 'vite-plus/test'
import { useListSelection } from '../../src/composables/_internal/use-list-selection'

describe('useListSelection', () => {
  it('should emit change immediately in single mode and ask to close', () => {
    const onUpdateModelValue = vi.fn()
    const onChange = vi.fn()
    const { apply, selected } = useListSelection({
      modelValue: null,
      onUpdateModelValue,
      onChange,
    })

    expect(apply(2)).toBe(true)
    expect(selected.value).toBe(2)
    expect(onUpdateModelValue).toHaveBeenCalledWith(2)
    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('should keep local multiple state without waiting for props', () => {
    const onUpdateModelValue = vi.fn()
    const onChange = vi.fn()
    const { apply, selected, commit } = useListSelection({
      multiple: true,
      modelValue: [],
      onUpdateModelValue,
      onChange,
    })

    expect(apply([1])).toBe(false)
    expect(apply([1, 3])).toBe(false)
    expect(apply([3])).toBe(false)
    expect(selected.value).toEqual([3])
    expect(onUpdateModelValue).toHaveBeenCalledTimes(3)
    expect(onChange).not.toHaveBeenCalled()

    commit()
    expect(onChange).toHaveBeenCalledWith([3])
  })

  it('should not emit change on commit when nothing changed', () => {
    const onUpdateModelValue = vi.fn()
    const onChange = vi.fn()
    const { commit } = useListSelection({
      multiple: true,
      modelValue: [],
      onUpdateModelValue,
      onChange,
    })

    commit()
    expect(onUpdateModelValue).not.toHaveBeenCalled()
    expect(onChange).not.toHaveBeenCalled()
  })
})
