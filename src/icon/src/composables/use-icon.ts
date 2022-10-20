import { type ComputedRef, computed } from 'vue'

import { appendCSSUnit } from '../../../_utils'
import type { IconProps } from '../constraints'

type UseIconReturnType = undefined | {
  color: string
  fontSize: string | undefined
}

export function useIcon (props: IconProps): ComputedRef<UseIconReturnType> {
  return computed(() => {
    const { size, color } = props

    if (!size && !color) return undefined

    return {
      color,
      fontSize: appendCSSUnit(size)
    }
  })
}
