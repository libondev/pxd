import type { ComputedRef } from 'vue'
import { computed, inject } from 'vue'

import { globalSymbol } from '../../_internal'
import type { Sizes } from '../../_types'

export function useSize (props: { size: Sizes }): ComputedRef<Sizes> {
  const globalContext = inject(globalSymbol, { size: '' })
  return computed(() => props.size || globalContext.size || 'medium')
}
