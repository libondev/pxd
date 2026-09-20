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

export function useListSelection(props: ListSelectionProps, emits: ListSelectionEmits) {
  const selected = shallowRef<ListModelValue>(readSelection(props))
  let dirty = false

  function reset() {
    dirty = false
    selected.value = readSelection(props)
  }

  function select(value: ComponentValue): boolean {
    if (props.multiple) {
      const nextValue = toggleSelected(toArray(selected.value) as ComponentValue[], value)
      selected.value = nextValue
      dirty = true
      emits('update:modelValue', nextValue)
      return false
    }

    selected.value = value
    emits('update:modelValue', value)
    emits('change', value)
    return true
  }

  function commit() {
    if (!props.multiple || !dirty) {
      return
    }

    dirty = false
    emits('change', selected.value ?? [])
  }

  return { selected, select, reset, commit }
}
