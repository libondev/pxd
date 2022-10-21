import type { Ref, WritableComputedRef } from 'vue'

export interface UseToggleOptions {
  truthyValue?: boolean | number | string
  falsyValue?: boolean | number | string
}

export function useToggle<T> (
  valueRef: Ref<T> | WritableComputedRef<T>,
  options: UseToggleOptions = {}
): (value?: T) => T {
  const {
    truthyValue = true,
    falsyValue = false
  } = options

  function toggle (value?: T): T {
    // has arguments
    if (arguments.length) {
      valueRef.value = value!
      return valueRef.value
    }

    valueRef.value = (valueRef.value === truthyValue ? falsyValue : truthyValue) as T
    return valueRef.value
  }

  return toggle
}
