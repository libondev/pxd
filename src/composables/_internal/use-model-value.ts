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
  { withChange = true, get, set }: ModelValueOptions = {},
): WritableComputedRef<P['modelValue']> {
  type V = NonNullable<P['modelValue']>

  const modelValue = computed<V>({
    get: get || (() => props.modelValue),
    set:
      set ||
      ((value: V) => {
        if (withChange) {
          emits('change', value)
        }
        emits('update:modelValue', value)
      }),
  })

  return modelValue
}
