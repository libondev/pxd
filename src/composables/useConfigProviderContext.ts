import type { ComputedRef } from 'vue'
import type { ComponentSize, ComponentSizeWithXs } from '../types/components'
import { computed, inject, provide } from 'vue'

import enUS from '../locales/en-US'
import { getFallbackValue } from '../utils/value'

export const injectionKey = 'configProvider'

export interface ConfigProviderProps {
  size?: ComponentSize
  locale?: Record<string, any>
}

export function provideConfigProvider(configProvider: ConfigProviderProps): void {
  provide(injectionKey, configProvider)
}

export function useConfigProvider(): Required<ConfigProviderProps> {
  const defaultConfig: Required<ConfigProviderProps> = {
    size: 'md',
    locale: enUS,
  }

  return inject(injectionKey, defaultConfig)
}

type ComponentSizeType = ComponentSize | ComponentSizeWithXs | undefined

export function useConfigProviderSize<
  Size extends ComponentSizeType,
  Values extends Record<string, any>,
>(
  propSize: Size,
  sizes: Values,
): ComputedRef<Values[keyof Values]> {
  const config = useConfigProvider()

  return computed(() => getFallbackValue(propSize, sizes, config.size))
}
