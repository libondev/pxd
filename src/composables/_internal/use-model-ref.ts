import type { MaybeRefOrGetter } from 'vue'
import { computed, shallowRef, toValue } from 'vue'

export interface ModelValueProps {
  modelValue?: any
}

export interface ModelValueEmits {
  (event: 'change', ...args: any[]): void
  (event: 'update:model-value', ...args: any[]): void
}

export interface ModelValueOptions {
  get?: () => any
  defaultValue?: MaybeRefOrGetter<any>
}

export function useModelRef<P extends ModelValueProps>(
  props: P,
  { defaultValue, get }: ModelValueOptions = {},
) {
  type V = NonNullable<P['modelValue']>

  const innerValue = shallowRef<V | undefined>(
    defaultValue !== undefined ? toValue(defaultValue) : undefined,
  )
  const isControlled = computed(() => props.modelValue !== undefined)

  const display = get || (() => (isControlled.value ? props.modelValue : innerValue.value))
  const write = (value: V) => {
    if (!isControlled.value) {
      innerValue.value = value
    }
  }

  return { display, write }
}
