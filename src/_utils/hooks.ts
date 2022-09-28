import type { ComputedRef } from 'vue'
import { computed, inject } from 'vue'

import type { Sizes } from '../../types'
import { formSymbol, globalSymbol } from '../_internal'

type SizesClassName = `carbons-${Sizes}`

export function useSizes (props: { size: Sizes }): ComputedRef<SizesClassName> {
  const globalContext = inject(globalSymbol, { size: 'medium' })
  return computed<SizesClassName>(() => `carbons-${props.size || globalContext.size || 'medium'}`)
}

export function useDisabled (props: any): ComputedRef<boolean> {
  const formContext = inject(formSymbol, { disabled: false })

  return computed(() => props.disabled || formContext.disabled)
}
