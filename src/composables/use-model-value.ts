import type { WritableComputedRef } from 'vue'

import { computed } from 'vue'

interface BaseProps {
  modelValue?: any
}

interface BaseEmits {
  (event: 'change', ...args: any[]): void
  (event: 'update:modelValue', ...args: any[]): void
}

interface ModelValueOptions {
  get?: (value: any) => any
  set?: (value: any) => void
  withChange?: boolean
}

export function useModelValue<P extends BaseProps, E extends BaseEmits>(
  props: P,
  emits: E,
  options: ModelValueOptions = { withChange: true },
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
