import type { Ref } from 'vue'
import { shallowRef } from 'vue'

interface UseDelayChangeReturnType<T> {
  value: Ref<T>
  setValue: (value: T) => void
  setValueDelay: (value: T) => void
}

export function useDelayChange<T>(defaultValue: T, delay = 1000): UseDelayChangeReturnType<T> {
  const delayValue = shallowRef(defaultValue)
  let timerId: ReturnType<typeof setTimeout>

  function setValueDelay(value: T) {
    clearTimeout(timerId)
    timerId = setTimeout(() => {
      setValue(value)
    }, delay)
  }

  function setValue(value: T) {
    clearTimeout(timerId)
    delayValue.value = value
  }

  return {
    value: delayValue,
    setValueDelay,
    setValue,
  }
}
