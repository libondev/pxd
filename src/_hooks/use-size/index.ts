import type { ComputedRef } from 'vue'
import { computed, inject } from 'vue'

import { globalSymbol } from '../../_internal'
import type { Sizes } from '../../_types'

type SizesClassName = `carbons-${Sizes}`

export function useSize (props: { size: Sizes }): ComputedRef<SizesClassName> {
  const globalContext = inject(globalSymbol, { size: 'medium' })
  return computed<SizesClassName>(() => `carbons-${props.size || globalContext.size || 'medium'}`)
}
