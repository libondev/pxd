import { describe, expect, it, vi } from 'vite-plus/test'
import { useListKeyboardController } from '../../src/composables/_internal/use-list-keyboard-controller'

describe('useListKeyboardController', () => {
  it('should delegate configured navigation keys', () => {
    const onCommand = vi.fn(() => true)
    const { onKeydown: handleKeydown } = useListKeyboardController({
      keymap: { ArrowDown: 'next' },
      onCommand,
    })
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true })

    handleKeydown(event)

    expect(onCommand).toHaveBeenCalledWith('next', event)
    expect(event.defaultPrevented).toBe(true)
  })

  it('should ignore text, composition, and unconfigured keys', () => {
    const onCommand = vi.fn(() => true)
    const { onKeydown: handleKeydown } = useListKeyboardController({
      keymap: { ArrowDown: 'next' },
      onCommand,
    })

    handleKeydown(new KeyboardEvent('keydown', { key: 'a' }))
    handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    handleKeydown(
      Object.assign(new KeyboardEvent('keydown', { key: 'ArrowDown' }), { isComposing: true }),
    )

    expect(onCommand).not.toHaveBeenCalled()
  })

  it('should leave unhandled commands untouched', () => {
    const onCommand = vi.fn(() => false)
    const { onKeydown: handleKeydown } = useListKeyboardController({
      keymap: { ArrowDown: 'next' },
      onCommand,
    })
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true })

    handleKeydown(event)

    expect(onCommand).toHaveBeenCalledWith('next', event)
    expect(event.defaultPrevented).toBe(false)
  })

  it('should prevent scrolling keys without dispatching navigation', () => {
    const onCommand = vi.fn(() => true)
    const { onKeydown: handleKeydown } = useListKeyboardController({
      keymap: { ArrowDown: 'next' },
      onCommand,
    })
    const event = new KeyboardEvent('keydown', { key: 'PageDown', cancelable: true })

    handleKeydown(event)

    expect(onCommand).not.toHaveBeenCalled()
    expect(event.defaultPrevented).toBe(true)
  })

  it('should use default scrolling keys for keys missing from the keymap', () => {
    const onCommand = vi.fn(() => true)
    const { onKeydown: handleKeydown } = useListKeyboardController({
      keymap: { ArrowDown: 'next' },
      onCommand,
    })
    const event = new KeyboardEvent('keydown', { key: 'PageDown', cancelable: true })

    handleKeydown(event)

    expect(onCommand).not.toHaveBeenCalled()
    expect(event.defaultPrevented).toBe(true)
  })

  it('should let the keymap take precedence over the default scrolling keys', () => {
    const onCommand = vi.fn(() => true)
    const { onKeydown: handleKeydown } = useListKeyboardController({
      keymap: { PageDown: 'next' },
      onCommand,
    })
    const event = new KeyboardEvent('keydown', { key: 'PageDown', cancelable: true })

    handleKeydown(event)

    expect(onCommand).toHaveBeenCalledWith('next', event)
    expect(event.defaultPrevented).toBe(true)
  })

  it('should leave modified keys alone', () => {
    const onCommand = vi.fn(() => true)
    const { onKeydown: handleKeydown } = useListKeyboardController({
      keymap: { PageDown: 'next' },
      onCommand,
    })
    const event = new KeyboardEvent('keydown', { key: 'PageDown', ctrlKey: true, cancelable: true })

    handleKeydown(event)

    expect(onCommand).not.toHaveBeenCalled()
    expect(event.defaultPrevented).toBe(false)
  })
})
