import type { MaybeRefOrGetter, Ref } from 'vue'
import { onBeforeUnmount, ref, watch } from 'vue'
import { toValue } from '../utils/ref'

interface Options<T> {
  deep?: boolean
  delay?: number
  valueChange?: (v: T) => void
}

interface Results<T> {
  value: Ref<T>
  deferred: Ref<T>
}

export function useDeferredValue<T>(
  defaultValue: MaybeRefOrGetter<T>,
  options: Options<T> = {},
): Results<T> {
  const { deep, delay = 300, valueChange } = options

  const syncValue = ref(toValue(defaultValue))
  const deferredValue = ref(syncValue.value)

  let syncTimeoutId: ReturnType<typeof setTimeout>

  const unwatch = watch(
    () => syncValue.value,
    (v) => {
      clearTimeout(syncTimeoutId)

      syncTimeoutId = setTimeout(() => {
        deferredValue.value = v
        valueChange?.(v)
      }, delay)
    },
    { deep },
  )

  onBeforeUnmount(() => {
    unwatch()
    clearTimeout(syncTimeoutId)
  })

  return {
    value: syncValue as Ref<T>,
    deferred: deferredValue,
  }
}
