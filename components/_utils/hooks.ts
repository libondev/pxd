import type { ComputedRef } from 'vue'
import { computed, inject } from 'vue'

import { formSymbol, globalSymbol } from '../_internal'
import type { Sizes } from '../_types'

type SizesClassName = `carbons-${Sizes}${'-fonts' | ''}`

export function useSizes (
  props: { size: Sizes },
  containsFont: boolean = true
): ComputedRef<SizesClassName> {
  const globalContext = inject(globalSymbol, { size: 'medium' })
  return computed<SizesClassName>(() => `carbons-${props.size || globalContext.size || 'medium'}${
    containsFont ? '-fonts' : ''
  }`)
}

export function useDisabled (props: any): ComputedRef<boolean> {
  const formContext = inject(formSymbol, { disabled: false })

  return computed(() => props.disabled || formContext.disabled)
}
