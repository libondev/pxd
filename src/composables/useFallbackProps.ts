import type { ComputedRef } from 'vue'
import type { ComponentSize, ComponentSizeWithXs } from '../types/components'

import { computed } from 'vue'
import { useConfigProvider } from './useConfigProviderContext'

type ComponentSizeType = ComponentSize | ComponentSizeWithXs | undefined

export function useComputedSize<
  Size extends ComponentSizeType,
  Values extends Record<string, any>,
>(
  propSize: Size,
  sizes: Values,
): ComputedRef<Values[keyof Values]> {
  const config = useConfigProvider()

  // props.size 不存在或者传递了一些奇怪的值，则回退到 config.size
  return computed(() => sizes[propSize || config.size] ?? sizes[config.size])
}

export function getFallbackVariant<
  Variants extends Record<string, any>,
>(variant: string, variants: Variants, defaultVariant: keyof Variants = 'default') {
  return variants[variant] ?? variants[defaultVariant]
}
