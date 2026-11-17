import type { ChangeAt } from '../../types/shared/change'
import type { ModelValueEmits, ModelValueOptions, ModelValueProps } from './use-model-ref.js'
import type { WritableComputedRef } from 'vue'
import { computed, getCurrentInstance } from 'vue'
import { notifyAgentChange } from '../../agent/report.js'
import { changeDetailsFor } from './use-change-details.js'
import { useModelRef } from './use-model-ref.js'

// A value that is written as it changes and announces `change` only where the component
// commits it, like a field on blur or a slider once the drag ends. `commit` takes what the
// component knows about the moment: why it happened, and the event when one is at hand.
export function useModelCommit<P extends ModelValueProps, E extends ModelValueEmits>(
  props: P,
  emits: E,
  options: ModelValueOptions = {},
): {
  modelValue: WritableComputedRef<P['modelValue']>
  commit: (value: P['modelValue'], at?: ChangeAt) => void
} {
  type V = NonNullable<P['modelValue']>

  const { display, write } = useModelRef(props, options)
  const instance = getCurrentInstance()

  const modelValue = computed<V>({
    get: display,
    set: (value: V) => {
      write(value)
      emits('update:model-value', value)
    },
  })

  const commit = (value: P['modelValue'], at?: ChangeAt) => {
    const details = changeDetailsFor(at)

    emits('change', value, details)

    if (instance) {
      notifyAgentChange(instance, value, details)
    }
  }

  return { modelValue, commit }
}
