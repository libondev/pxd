import type { ListModelValue } from '../../components/list/types'
import type { ComponentValue } from '../../types/shared'
import { shallowRef } from 'vue'
import { toArray } from '../../utils/format.js'

interface ListSelectionProps {
  modelValue?: ListModelValue
  multiple?: boolean
}

interface ListSelectionEmits {
  (event: 'change', value: NonNullable<ListModelValue>): void
  (event: 'update:modelValue', value: NonNullable<ListModelValue>): void
}

function readSelection(props: ListSelectionProps): ListModelValue {
  return props.multiple
    ? (toArray(props.modelValue) as ComponentValue[])
    : (props.modelValue ?? null)
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
export function useListSelection(props: ListSelectionProps, emits: ListSelectionEmits) {
  const selected = shallowRef<ListModelValue>(readSelection(props))
  let dirty = false

  function reset() {
    dirty = false
    selected.value = readSelection(props)
  }

  function apply(nextValue: NonNullable<ListModelValue>): boolean {
    selected.value = nextValue

    if (props.multiple) {
      dirty = true
      emits('update:modelValue', nextValue)
      return false
    }

    emits('update:modelValue', nextValue)
    emits('change', nextValue)
    return true
  }

  function commit() {
    if (!props.multiple || !dirty) {
      return
    }

    dirty = false
    emits('change', selected.value ?? [])
  }

  return { selected, apply, reset, commit }
}
