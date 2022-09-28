import type { ComputedRef } from 'vue'
import { computed, inject } from 'vue'

import type { Sizes } from '../../types'
import { globalSymbol } from '../_internal'

type SizesClassName = `carbons-${Sizes}`

export function useSize (props: { size: Sizes }): ComputedRef<SizesClassName> {
  const globalContext = inject(globalSymbol, { size: 'medium' })
  return computed<SizesClassName>(() => `carbons-${props.size || globalContext.size || 'medium'}`)
}
