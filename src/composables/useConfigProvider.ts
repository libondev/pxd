import { inject, provide } from 'vue'

export const injectionKey = 'configProvider'

export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg'

export interface ConfigProviderProps {
  size?: ComponentSize
}

export const defaultConfig: Required<ConfigProviderProps> = {
  size: 'md',
}

export function provideConfigProvider(configProvider: ConfigProviderProps) {
  provide(injectionKey, configProvider)
}

export function useConfigProvider() {
  return inject(injectionKey, defaultConfig)
}
