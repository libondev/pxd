import type { ListNavigationCommand } from './use-list-navigation'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from '../../utils/helper.js'

export type ListKeyboardMap = Readonly<Record<string, ListNavigationCommand>>

export interface UseListKeyboardControllerOptions {
  keymap: MaybeRefOrGetter<ListKeyboardMap>
  enabled?: MaybeRefOrGetter<boolean>
  preventDefaultKeys?: MaybeRefOrGetter<readonly string[]>
  onCommand: (command: ListNavigationCommand, ev: KeyboardEvent) => boolean
}

const DEFAULT_PREVENT_DEFAULT_KEYS = ['PageDown', 'PageUp']

/**
 * Creates a keyboard event handler for list navigation.
 *
 * The handler maps enabled keyboard events to semantic navigation commands
 * while ignoring IME composition events.
 *
 * @param options - Configuration for the list target, enabled state, and keys.
 * @returns A keyboard event handler for list navigation.
 */
export function useListKeyboardController(options: UseListKeyboardControllerOptions) {
  function onKeydown(ev: KeyboardEvent): void {
    if (toValue(options.enabled) === false || ev.isComposing || ev.key === 'Process') {
      return
    }

    const preventDefaultKeys = toValue(options.preventDefaultKeys) ?? DEFAULT_PREVENT_DEFAULT_KEYS
    if (preventDefaultKeys.includes(ev.key)) {
      ev.preventDefault()
      return
    }

    if (ev.ctrlKey || ev.metaKey || ev.altKey || ev.shiftKey) {
      return
    }

    const command = toValue(options.keymap)[ev.key]
    if (!command) {
      return
    }

    if (!options.onCommand(command, ev)) {
      return
    }

    ev.preventDefault()
    ev.stopPropagation()
  }

  return { onKeydown }
}
