import type { ModelValueEmits, ModelValueOptions, ModelValueProps } from './use-model-ref.js'
import type { WritableComputedRef } from 'vue'
import { computed } from 'vue'
import { cancelableChangeDetails } from './use-change-details.js'
import { useModelRef } from './use-model-ref.js'

// A value whose every write is a change: assign it and `change` fires.
// A component whose change is a commit instead uses `useModelCommit`.
export function useModelValue<P extends ModelValueProps, E extends ModelValueEmits>(
  props: P,
  emits: E,
  options: ModelValueOptions = {},
): WritableComputedRef<P['modelValue']> {
  type V = NonNullable<P['modelValue']>

  const { display, write } = useModelRef(props, options)

  return computed<V>({
    get: display,
    set: (value: V) => {
      const details = cancelableChangeDetails()
      emits('change', value, details)

      if (details.canceled) {
        return
      }

      write(value)
      emits('update:model-value', value)
    },
  })
}
