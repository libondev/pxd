import type { WritableComputedRef } from 'vue'
import { computed } from 'vue'

interface Options {
  get?: (value: any) => any
  set?: (value: any) => void
}

export function useModelValue<
  P extends { modelValue: any },
  E extends { (event: 'update:modelValue', ...args: any[]): void },
>(props: P, emits: E, options: Options = {}): WritableComputedRef<NonNullable<P['modelValue']>> {
  type V = NonNullable<P['modelValue']>

  const modelValue = computed<V>({
    get: options.get || (() => props.modelValue),
    set: options.set || ((value: V) => emits('update:modelValue', value)),
  })

  return modelValue
}
