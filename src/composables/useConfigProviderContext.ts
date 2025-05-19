import type { ComponentSize } from '../types/components'
import { inject, provide } from 'vue'
import enUS from '../locales/en-US'

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
