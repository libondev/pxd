import type { ListModelValue } from '../../components/list/types'
import type { ComponentValue } from '../../types/shared/props'
import type { MaybeRefOrGetter } from 'vue'
import { shallowRef, toValue } from 'vue'
import { toArray } from '../../utils/format.js'

interface ListSelectionOptions {
  modelValue?: MaybeRefOrGetter<ListModelValue | undefined>
  multiple?: MaybeRefOrGetter<boolean | undefined>
  onChange?: (value: NonNullable<ListModelValue>) => void
  onUpdateModelValue?: (value: NonNullable<ListModelValue>) => void
}

function readSelection(options: ListSelectionOptions): ListModelValue {
  const value = toValue(options.modelValue)

  return toValue(options.multiple) ? (toArray(value) as ComponentValue[]) : (value ?? null)
}

function toggleSelected(selected: ComponentValue[], value: ComponentValue): ComponentValue[] {
  return selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]
}

/** Next model value after an option click. Used by List; Menu only applies the result. */
export function resolveNextListValue(
  current: ListModelValue | undefined,
  clicked: ComponentValue,
  multiple?: boolean,
): ListModelValue {
  if (multiple) {
    return toggleSelected(toArray(current) as ComponentValue[], clicked)
  }

  return clicked
}

/**
 * Menu selection session. `apply(next)` accepts the value already computed by List —
 * do not toggle again here.
 */
export function useListSelection(options: ListSelectionOptions) {
  const selected = shallowRef<ListModelValue>(readSelection(options))
  let dirty = false

  const isMultiple = () => toValue(options.multiple) ?? false

  function reset() {
    dirty = false
    selected.value = readSelection(options)
  }

  function apply(nextValue: NonNullable<ListModelValue>): boolean {
    selected.value = nextValue

    if (isMultiple()) {
      dirty = true
      options.onUpdateModelValue?.(nextValue)
      return false
    }

    options.onUpdateModelValue?.(nextValue)
    options.onChange?.(nextValue)
    return true
  }

  function commit() {
    if (!isMultiple() || !dirty) {
      return
    }

    dirty = false
    options.onChange?.(selected.value ?? [])
  }

  return { selected, apply, reset, commit }
}
