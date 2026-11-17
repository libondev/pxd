import type { ChangeAt } from '../../types/shared/change'
import type { ModelValueEmits, ModelValueOptions, ModelValueProps } from './use-model-ref.js'
import type { WritableComputedRef } from 'vue'
import { computed, getCurrentInstance } from 'vue'
import { notifyAgentChange } from '../../agent/report.js'
import { cancelableChangeDetails, cancelableChangeDetailsFor } from './use-change-details.js'
import { useModelRef } from './use-model-ref.js'

// A value whose every write is a change. Two ways in, and the one a component uses says
// what it knows: `change(value, at)` names why and the event behind it, while assigning the
// ref writes the same value and names nothing.
export function useModelValue<P extends ModelValueProps, E extends ModelValueEmits>(
  props: P,
  emits: E,
  options: ModelValueOptions = {},
): {
  modelValue: WritableComputedRef<P['modelValue']>
  change: (value: P['modelValue'], at: ChangeAt) => boolean
} {
  type V = NonNullable<P['modelValue']>

  const { display, write } = useModelRef(props, options)
  const instance = getCurrentInstance()

  const announce = (value: V, details: ReturnType<typeof cancelableChangeDetails>) => {
    emits('change', value, details)

    if (instance) {
      notifyAgentChange(instance, value, details)
    }

    if (details.canceled) {
      return false
    }

    write(value)
    emits('update:model-value', value)

    return true
  }

  const modelValue = computed<V>({
    get: display,
    set: (value: V) => {
      announce(value, cancelableChangeDetails())
    },
  })

  const change = (value: P['modelValue'], at: ChangeAt) =>
    announce(value as V, cancelableChangeDetailsFor(at))

  return { modelValue, change }
}
