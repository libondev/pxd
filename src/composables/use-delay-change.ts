import type { MaybeRefOrGetter, Ref } from 'vue'
import { shallowRef } from 'vue'

interface Options<T> {
  delay?: number
  valueChange?: (v: T) => void
}

interface Results<T> {
  value: Ref<T>
  setValue: (value: T, immediate?: boolean) => void
}

export function useDelayChange<T>(
  value: MaybeRefOrGetter<T>,
  options: Options<T> = {},
): Results<T> {
  const { delay = 300, valueChange } = options

  let timerId: ReturnType<typeof setTimeout>
  const delayValue = shallowRef(value as T)

  function setValue(newValue: T, immediate = false) {
    clearTimeout(timerId)

    if (immediate) {
      delayValue.value = newValue
      valueChange?.(delayValue.value)
      return
    }

    timerId = setTimeout(() => {
      delayValue.value = newValue
      valueChange?.(delayValue.value)
    }, delay)
  }

  return {
    value: delayValue,
    setValue,
  }
}
