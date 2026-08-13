import type { ConfigProviderProps } from '../components/config-provider/types'
import type { Locale } from '../locales'
import enUS from '../locales/en-us'
import { createContext } from '../utils/context'

export const injectionKey = 'ConfigProvider'

export interface ConfigProviderContext extends Omit<Required<ConfigProviderProps>, 'locale'> {
  locale: Locale
}

export const [provideConfigProvider, useConfigProvider] = createContext<ConfigProviderContext>(
  injectionKey,
  {
    size: 'md',
    locale: enUS,
    enterMotion: true,
    leaveMotion: true,
  },
)
