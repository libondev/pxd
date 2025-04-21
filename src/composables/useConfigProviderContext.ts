import { inject, provide } from 'vue'

export const injectionKey = 'configProvider'

export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg'

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
