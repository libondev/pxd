import type { ComputedRef } from 'vue'
import { computed, inject } from 'vue'

import { formSymbol } from '../../_internal'

export function useDisabled (props: any, injectKey = formSymbol): ComputedRef<boolean> {
  const formContext = inject(injectKey, { disabled: false })

  return computed(() => props.disabled || formContext.disabled)
}
