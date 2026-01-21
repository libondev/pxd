import { shallowRef } from 'vue'

interface Options {
  truthyValue?: any
  falsyValue?: any
}

export function useToggleValue(initialValue: boolean = false, options: Options = {}) {
  const {
    truthyValue = true,
    falsyValue = false,
  } = options

  const value = shallowRef(initialValue)

  function toggle(newValue?: boolean) {
    value.value = newValue ?? (value.value === truthyValue ? falsyValue : truthyValue)
  }

  return {
    value,
    toggle,
  }
}
