import type { Ref } from 'vue'
import { shallowRef } from 'vue'

interface UseDelayChangeReturnType<T> {
  value: Ref<T>
  set: (value: T) => void
  setImmediate: (value: T) => void
}

export function useDelayChange<T>(defaultValue: T, delay = 1000): UseDelayChangeReturnType<T> {
  const delayValue = shallowRef(defaultValue)
  let timerId: ReturnType<typeof setTimeout>

  function set(value: T) {
    clearTimeout(timerId)
    timerId = setTimeout(() => {
      setImmediate(value)
    }, delay)
  }

  function setImmediate(value: T) {
    clearTimeout(timerId)
    delayValue.value = value
  }

  return {
    value: delayValue,
    set,
    setImmediate,
  }
}
