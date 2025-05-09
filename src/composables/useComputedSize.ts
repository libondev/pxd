import type { ComponentSize } from '../types/components'
import { useConfigProvider } from './useConfigProviderContext'

export function useComputedSize<Size extends ComponentSize>(
  propSize: Size,
  sizes: Record<string, number | string>,
) {
  const config = useConfigProvider()

  // props.size 不存在或者传递了一些奇怪的值，则回退到 config.size
  return sizes[propSize || config.size] ?? sizes[config.size]
}
