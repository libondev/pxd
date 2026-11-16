import type { ModelValueEmits, ModelValueOptions, ModelValueProps } from './use-model-ref.js'
import type { WritableComputedRef } from 'vue'
import { computed } from 'vue'
import { changeDetails } from './use-change-details.js'
import { useModelRef } from './use-model-ref.js'

// A value that is written as it changes and announces `change` only where the
// component commits it, like a field on blur or a slider once the drag ends.
export function useModelCommit<P extends ModelValueProps, E extends ModelValueEmits>(
  props: P,
  emits: E,
  options: ModelValueOptions = {},
): {
  modelValue: WritableComputedRef<P['modelValue']>
  commit: (...args: unknown[]) => void
} {
  type V = NonNullable<P['modelValue']>

  const { display, write } = useModelRef(props, options)

  const modelValue = computed<V>({
    get: display,
    set: (value: V) => {
      write(value)
      emits('update:model-value', value)
    },
  })

  const commit = (...args: unknown[]) => {
    emits('change', ...args, changeDetails())
  }

  return { modelValue, commit }
}
