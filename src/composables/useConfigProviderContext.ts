import type { ComponentSize } from '../types/components'
import { inject, provide } from 'vue'

export const injectionKey = 'configProvider'

export interface ConfigProviderProps {
  size?: ComponentSize
}

export function provideConfigProvider(configProvider: ConfigProviderProps) {
  provide(injectionKey, configProvider)
}

export function useConfigProvider() {
  const defaultConfig: Required<ConfigProviderProps> = {
    size: 'md',
  }

  return inject(injectionKey, defaultConfig)
}
