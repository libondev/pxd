import type { ComputedRef } from 'vue'
import { computed, inject } from 'vue'

import { globalSymbol } from '../../_internal'

export function useZIndex (): ComputedRef<number | undefined> {
  const globalContext = inject(globalSymbol, { zIndex: undefined })
  return computed(() => globalContext?.zIndex)
}
