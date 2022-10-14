import { isRef, ref } from 'vue'

export interface UseToggleOptions<Truthy, Falsy> {
  truthyValue?: Truthy
  falsyValue?: Falsy
}

export function useToggle (
  initialValue: boolean = false,
  options: UseToggleOptions<true, false> = {}
): any {
  const {
    truthyValue = true,
    falsyValue = false
  } = options

  const valueIsRef = isRef(initialValue)
  const _value = ref(initialValue)

  function toggle (value?: boolean): boolean {
    // has arguments
    if (arguments.length) {
      _value.value = value!
      return _value.value
    } else {
      _value.value = _value.value === truthyValue
        ? falsyValue
        : truthyValue

      return _value.value
    }
  }

  if (valueIsRef) {
    return toggle
  } else {
    return [_value, toggle] as const
  }
}
