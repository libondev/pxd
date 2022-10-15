import type { ComputedRef } from 'vue'
import { computed, inject } from 'vue'

import { formSymbol } from '../../_internal'

export function useDisabled (props: any): ComputedRef<boolean> {
  const formContext = inject(formSymbol, { disabled: false })

  return computed(() => props.disabled || formContext.disabled)
}
