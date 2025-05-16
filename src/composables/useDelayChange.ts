import { shallowRef } from 'vue'

export function useDelayChange<T>(value: T, delayTime = 1000) {
  const delayValue = shallowRef(value)
  let timerId: ReturnType<typeof setTimeout>

  function set(value: T) {
    clearTimeout(timerId)
    timerId = setTimeout(() => {
      setImmediate(value)
    }, delayTime)
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
