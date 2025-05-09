import type { ComponentSize, ComponentSizeWithXs } from '../types/components'
import { useConfigProvider } from './useConfigProviderContext'

type ComponentSizeType = ComponentSize | ComponentSizeWithXs | undefined

export function useComputedSize<
  Size extends ComponentSizeType,
  Values extends Record<string, any>,
>(
  propSize: Size,
  sizes: Values,
): Values[keyof Values] {
  const config = useConfigProvider()

  // props.size 不存在或者传递了一些奇怪的值，则回退到 config.size
  return sizes[propSize || config.size] ?? sizes[config.size]
}
