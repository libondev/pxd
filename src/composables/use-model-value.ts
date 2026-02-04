import type { WritableComputedRef } from 'vue'

import { computed } from 'vue'

interface Options {
  get?: (value: any) => any
  set?: (value: any) => void
  withChange?: boolean
}

interface BaseEmit {
  (event: 'change', ...args: any[]): void
  (event: 'update:modelValue', ...args: any[]): void
}

export function useModelValue<P extends { modelValue: any }, E extends BaseEmit>(
  props: P,
  emits: E,
  options: Options = { withChange: true },
): WritableComputedRef<NonNullable<P['modelValue']>> {
  type V = NonNullable<P['modelValue']>

  const modelValue = computed<V>({
    get: options.get || (() => props.modelValue),
    set:
      options.set ||
      ((value: V) => {
        if (options.withChange) {
          emits('change', value)
        }
        emits('update:modelValue', value)
      }),
  })

  return modelValue
}
