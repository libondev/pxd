import { describe, expect, it, vi } from 'vite-plus/test'
import { shallowRef } from 'vue'
import { useListKeyboardController } from '../../src/composables/use-list-keyboard-controller'

describe('useListKeyboardController', () => {
  it('should delegate configured navigation keys', () => {
    const onKeydown = vi.fn()
    const { onKeydown: handleKeydown } = useListKeyboardController({
      list: { onKeydown },
      keys: ['ArrowDown'],
    })
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })

    handleKeydown(event)

    expect(onKeydown).toHaveBeenCalledWith(event)
  })

  it('should ignore text, composition, and unconfigured keys', () => {
    const onKeydown = vi.fn()
    const list = shallowRef({ onKeydown })
    const { onKeydown: handleKeydown } = useListKeyboardController({
      list,
      keys: ['ArrowDown'],
    })

    handleKeydown(new KeyboardEvent('keydown', { key: 'a' }))
    handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    handleKeydown(
      Object.assign(new KeyboardEvent('keydown', { key: 'ArrowDown' }), { isComposing: true }),
    )

    expect(onKeydown).not.toHaveBeenCalled()
  })
})
