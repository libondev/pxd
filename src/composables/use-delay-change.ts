import type { Ref } from 'vue'
import { shallowRef } from 'vue'

interface UseDelayChangeReturnType<T> {
  value: Ref<T>
  setValue: (value: T, immediate?: boolean) => void
}

export function useDelayChange<T>(defaultValue: T, delayMs = 1000): UseDelayChangeReturnType<T> {
  let timerId: ReturnType<typeof setTimeout>
  const delayValue = shallowRef(defaultValue)

  function setValue(newValue: T, immediate = false) {
    clearTimeout(timerId)

    if (immediate) {
      delayValue.value = newValue
      return
    }

    timerId = setTimeout(() => {
      delayValue.value = newValue
    }, delayMs)
  }

  return {
    value: delayValue,
    setValue,
  }
}
