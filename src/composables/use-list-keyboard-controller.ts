import type { MaybeRefOrGetter } from 'vue'
import { toValue } from '../utils/helper'

export interface ListKeyboardTarget {
  onKeydown: (ev: KeyboardEvent) => void
}

export interface UseListKeyboardControllerOptions {
  list: MaybeRefOrGetter<ListKeyboardTarget | undefined>
  enabled?: MaybeRefOrGetter<boolean>
  keys?: MaybeRefOrGetter<readonly string[]>
}

const DEFAULT_KEYS = ['ArrowDown', 'ArrowUp', 'Enter', 'PageDown', 'PageUp']

export function useListKeyboardController(options: UseListKeyboardControllerOptions) {
  function onKeydown(ev: KeyboardEvent): void {
    if (toValue(options.enabled) === false || ev.isComposing || ev.key === 'Process') {
      return
    }

    const keys = toValue(options.keys) ?? DEFAULT_KEYS
    if (!keys.includes(ev.key)) {
      return
    }

    toValue(options.list)?.onKeydown(ev)
  }

  return { onKeydown }
}
