import type { ComputedRef } from 'vue'
import { computed, inject } from 'vue'

import { formSymbol, globalSymbol } from '../_internal/injectKeys'
import type { Sizes } from '../_types/props'

type SizesClassName = `size-${Sizes}`

export function useSizes (props: { size: Sizes }): ComputedRef<SizesClassName> {
  const globalContext = inject(globalSymbol, { size: 'medium' })
  return computed<SizesClassName>(() => `size-${(props.size || globalContext.size || 'medium')}`)
}

export function useDisabled (props: any): ComputedRef<boolean> {
  const formContext = inject(formSymbol, { disabled: false })

  return computed(() => props.disabled || formContext.disabled)
}
