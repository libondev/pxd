import { computed } from 'vue'

export function useModelValue<
  P extends { modelValue: any },
  E extends { (event: 'update:modelValue', ...args: any[]): void },
>(props: P, emits: E) {
  type V = P['modelValue']

  const modelValue = computed<V>({
    get: () => props.modelValue,
    set: (value: V) => emits('update:modelValue', value),
  })

  return modelValue
}
