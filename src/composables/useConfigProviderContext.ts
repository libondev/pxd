import type { ComponentSize } from '../types/shared'
import enUS from '../locales/en-us'
import { createContext } from '../utils/context'

export const injectionKey = 'ConfigProvider'

export interface ConfigProviderProps {
  size?: ComponentSize
  locale?: Record<string, any>
}

export const [
  provideConfigProvider,
  useConfigProvider,
] = createContext<Required<ConfigProviderProps>>(
  injectionKey,
  {
    size: 'md',
    locale: enUS,
  },
)
