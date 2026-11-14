import type { MaybeRefOrGetter, WritableComputedRef } from 'vue'
import { computed, shallowRef, toValue } from 'vue'

interface BaseProps {
  modelValue?: any
}

interface BaseEmits {
  (event: 'change', ...args: any[]): void
  (event: 'update:model-value', ...args: any[]): void
}

interface ModelValueOptions {
  get?: (value: any) => any
  withChange?: boolean
  defaultValue?: MaybeRefOrGetter<any>
}

export function useModelValue<P extends BaseProps, E extends BaseEmits>(
  props: P,
  emits: E,
  { withChange = true, defaultValue, get }: ModelValueOptions = {},
): WritableComputedRef<P['modelValue']> {
  type V = NonNullable<P['modelValue']>

  const innerValue = shallowRef<V | undefined>(
    defaultValue !== undefined ? toValue(defaultValue) : undefined,
  )
  const isControlled = computed(() => props.modelValue !== undefined)

  const modelValue = computed<V>({
    get: get || (() => (isControlled.value ? props.modelValue : innerValue.value)),
    set: (value: V) => {
      if (!isControlled.value) {
        innerValue.value = value
      }

      if (withChange) {
        emits('change', value)
      }
      emits('update:model-value', value)
    },
  })

  return modelValue
}
