import type { Ref } from 'vue'
import { computed, inject } from 'vue'

import { formSymbol } from '../_internal/inject'

export function useDisabled (props: any): Ref<boolean> {
  const formContext = inject(formSymbol, { disabled: false })

  return computed(() => props.disabled || formContext.disabled)
}
